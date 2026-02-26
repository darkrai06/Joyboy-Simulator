"""
Bayesian Optimization for one-time telecom package pricing.

Uses Gaussian Process surrogate model with Expected Improvement (EI)
acquisition function to find optimal package parameters that maximize E[Π].
"""

import math
import numpy as np
from typing import Dict, Any, List

from .monte_carlo import SimParams, PackageSpec, run_monte_carlo


def bayesian_optimize(
    packages: List[PackageSpec],
    price_min: float,
    price_max: float,
    data_gb_min: float,
    data_gb_max: float,
    voice_min_min: float,
    voice_min_max: float,
    validity_min: int,
    validity_max: int,
    params: SimParams,
    M: int,
    base_seed: int,
    n_iterations: int = 30,
    n_initial: int = 10,
) -> Dict[str, Any]:
    """
    Run Bayesian Optimization to find the package parameters maximizing E[Π].
    Divides the search space into "Budget", "Standard", and "Premium" sub-ranges
    and performs independent BO on each to provide multiple optimized tiers.

    Returns: optimal_package (the best overall), max_expected_profit, bo_convergence,
             bo_evaluations, full_mc_result, and multiple offers.
    """
    from skopt import gp_minimize
    from skopt.space import Real, Integer

    # Divide search space into 3 tiers by lerping between min and max
    # Budget:    0%  - 33% 
    # Standard: 33%  - 67%
    # Premium:  67%  - 100%
    price_span = price_max - price_min
    data_span = data_gb_max - data_gb_min
    voice_span = voice_min_max - voice_min_min
    val_span = validity_max - validity_min
    
    tier_specs = [
        {"name": "Budget", "low": 0.0, "high": 0.33},
        {"name": "Standard", "low": 0.33, "high": 0.67},
        {"name": "Premium", "low": 0.67, "high": 1.0},
    ]

    all_offers = []
    
    # Track the global best BO state for the main result
    global_best_profit = -float('inf')
    global_best_result = None
    global_evaluations = []
    global_convergence = []

    for tier in tier_specs:
        low, high = tier["low"], tier["high"]
        
        t_price_min = price_min + low * price_span
        t_price_max = price_min + high * price_span
        t_data_min = data_gb_min + low * data_span
        t_data_max = data_gb_min + high * data_span
        t_voice_min = voice_min_min + low * voice_span
        t_voice_max = voice_min_min + high * voice_span
        t_val_min = validity_min + int(low * val_span)
        t_val_max = validity_min + int(high * val_span)
        
        # Ensure val max >= min
        t_val_max = max(t_val_min, t_val_max)

        space = [
            Real(t_price_min, t_price_max, name="price"),
            Real(t_data_min, t_data_max, name="data_gb"),
            Real(t_voice_min, t_voice_max, name="voice_min"),
            Integer(t_val_min, t_val_max, name="validity_days"),
        ]

        # For multiple tiers, do shorter optimizations to save time
        tier_iters = max(10, n_iterations // 3)
        tier_init = max(5, n_initial // 2)

        evaluations: List[Dict] = []
        best_profit_so_far: List[float] = []
        call_counter = [0]

        def objective(x):
            price, data_gb, voice_min, validity_days = x[0], x[1], x[2], int(x[3])
            seed_i = base_seed + call_counter[0] * 997
            call_counter[0] += 1

            pkg = PackageSpec(
                data_gb=data_gb,
                voice_min=voice_min,
                validity_days=validity_days,
                price=price,
                label=f"{tier['name']}-BO-{call_counter[0]}",
            )

            # Lighter MC for BO evaluations
            eval_M = max(50, M // 3)
            mc_result = run_monte_carlo(
                pkg=pkg,
                params=params,
                M=eval_M,
                base_seed=seed_i,
                n_jobs=1,  # no nested parallelism
            )
            obj_profit = mc_result["risk_adjusted_profit"]

            evaluations.append({
                "price": float(price),
                "data_gb": float(data_gb),
                "voice_min": float(voice_min),
                "validity_days": int(validity_days),
                "expected_profit": float(mc_result["expected_profit"]),
                "risk_adjusted_profit": float(obj_profit),
            })

            current_best = max(e["risk_adjusted_profit"] for e in evaluations)
            best_profit_so_far.append(float(current_best))

            return -obj_profit  # minimize negative profit

        try:
            result = gp_minimize(
                func=objective,
                dimensions=space,
                n_calls=tier_iters + tier_init,
                n_initial_points=tier_init,
                acq_func="EI",
                random_state=base_seed,
                noise=1e-10,
            )
            
            tier_max_profit = float(-result.fun)
            
            # Record global evaluation trace
            global_evaluations.extend(evaluations)
            
            # Form optimal package for this tier
            tier_opt_pkg = PackageSpec(
                data_gb=float(result.x[1]),
                voice_min=float(result.x[2]),
                validity_days=int(result.x[3]),
                price=float(result.x[0]),
                label=tier["name"],
            )
            
            # Run full MC
            full_mc = run_monte_carlo(
                pkg=tier_opt_pkg,
                params=params,
                M=M,
                base_seed=base_seed,
                n_jobs=-1,
            )
            
            offers_dict = {
                "label": tier["name"],
                "data_gb": tier_opt_pkg.data_gb,
                "voice_min": tier_opt_pkg.voice_min,
                "validity_days": tier_opt_pkg.validity_days,
                "price": tier_opt_pkg.price,
                "expected_profit": full_mc["expected_profit"],
                "risk_adjusted_profit": full_mc["risk_adjusted_profit"],
                "ci_lower": full_mc["ci_lower"],
                "ci_upper": full_mc["ci_upper"],
                "variance": full_mc["variance"],
                "std": full_mc["std"],
            }
            all_offers.append((offers_dict, tier_opt_pkg, full_mc))
            
            # Update global best if this tier is the best
            if full_mc["risk_adjusted_profit"] > global_best_profit:
                global_best_profit = full_mc["risk_adjusted_profit"]
                global_best_result = (tier_opt_pkg, full_mc, best_profit_so_far)
                
        except Exception as e:
            print(f"Failed to optimize tier {tier['name']}: {e}")

    # Process overall best result
    # In case all failed (should not happen), fallback to last generated
    if not global_best_result and all_offers:
        global_best_result = (all_offers[0][1], all_offers[0][2], [])
        global_best_profit = all_offers[0][2]["risk_adjusted_profit"]

    optimal_pkg, full_mc, best_profit_so_far = global_best_result
    
    # Sort all recorded offers for response
    all_offers_dicts = [o[0] for o in all_offers]
    all_offers_dicts.sort(key=lambda o: o["risk_adjusted_profit"], reverse=True)

    return {
        "optimal_package": PackageSpec(
            data_gb=optimal_pkg.data_gb,
            voice_min=optimal_pkg.voice_min,
            validity_days=optimal_pkg.validity_days,
            price=optimal_pkg.price,
            label="Optimal",
        ),
        "max_expected_profit": global_best_profit,
        "bo_convergence": best_profit_so_far,
        "bo_evaluations": global_evaluations,
        "full_mc_result": full_mc,
        "offers": all_offers_dicts
    }
