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

    Optimizes the first package in the portfolio. Uses scikit-optimize's
    gp_minimize with negative E[Π] as objective (since gp_minimize minimizes).

    Returns: optimal package spec, max profit, bo_convergence,
             bo_evaluations, and the full MC result at the optimal point.
    """
    from skopt import gp_minimize
    from skopt.space import Real, Integer

    # Build search space for the first package
    space = [
        Real(price_min, price_max, name="price"),
        Real(data_gb_min, data_gb_max, name="data_gb"),
        Real(voice_min_min, voice_min_max, name="voice_min"),
        Integer(validity_min, validity_max, name="validity_days"),
    ]

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
            label=f"BO-{call_counter[0]}",
        )

        mc_result = run_monte_carlo(
            pkg=pkg,
            params=params,
            M=M,
            base_seed=seed_i,
            n_jobs=1,  # no nested parallelism
        )
        e_profit = mc_result["expected_profit"]

        evaluations.append({
            "price": float(price),
            "data_gb": float(data_gb),
            "voice_min": float(voice_min),
            "validity_days": int(validity_days),
            "expected_profit": float(e_profit),
        })

        current_best = max(e["expected_profit"] for e in evaluations)
        best_profit_so_far.append(float(current_best))

        return -e_profit  # minimize negative profit

    result = gp_minimize(
        func=objective,
        dimensions=space,
        n_calls=n_iterations + n_initial,
        n_initial_points=n_initial,
        acq_func="EI",
        random_state=base_seed,
        noise=1e-10,
    )

    optimal_price = float(result.x[0])
    optimal_data_gb = float(result.x[1])
    optimal_voice_min = float(result.x[2])
    optimal_validity = int(result.x[3])

    optimal_pkg = PackageSpec(
        data_gb=optimal_data_gb,
        voice_min=optimal_voice_min,
        validity_days=optimal_validity,
        price=optimal_price,
        label="Optimal",
    )

    # Full MC at optimal point with more simulations for accurate stats
    full_mc = run_monte_carlo(
        pkg=optimal_pkg,
        params=params,
        M=M,
        base_seed=base_seed,
        n_jobs=-1,
    )

    return {
        "optimal_package": optimal_pkg,
        "max_expected_profit": float(-result.fun),
        "bo_convergence": best_profit_so_far,
        "bo_evaluations": evaluations,
        "full_mc_result": full_mc,
    }
