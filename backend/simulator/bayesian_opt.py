"""
Bayesian Optimization wrapper using scikit-optimize.

Uses Gaussian Process surrogate model with Expected Improvement (EI)
acquisition function to find optimal (price, data_cap) that maximizes E[Π].
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple

from .monte_carlo import SimParams, run_monte_carlo


def bayesian_optimize(
    price_min: float,
    price_max: float,
    data_cap_min: float,
    data_cap_max: float,
    params: SimParams,
    M: int,
    base_seed: int,
    n_iterations: int = 30,
    n_initial: int = 10,
) -> Dict[str, Any]:
    """
    Run Bayesian Optimization to find (price, data_cap) maximizing E[Π].

    Uses scikit-optimize's gp_minimize with negative E[Π] as objective
    (since gp_minimize minimizes).

    Returns: optimal_price, optimal_data_cap, max_profit, bo_convergence,
             bo_evaluations, and the full MC result at the optimal point.
    """
    from skopt import gp_minimize
    from skopt.space import Real

    space = [
        Real(price_min, price_max, name="price"),
        Real(data_cap_min, data_cap_max, name="data_cap"),
    ]

    evaluations: List[Dict] = []
    best_profit_so_far: List[float] = []
    call_counter = [0]

    def objective(x):
        price, data_cap = x[0], x[1]
        seed_i = base_seed + call_counter[0] * 997
        call_counter[0] += 1

        mc_result = run_monte_carlo(
            price=price,
            data_cap=data_cap,
            params=params,
            M=M,
            base_seed=seed_i,
            n_jobs=1,  # inner job: no nested parallelism
        )
        e_profit = mc_result["expected_profit"]

        evaluations.append({
            "price": float(price),
            "data_cap": float(data_cap),
            "expected_profit": float(e_profit),
        })

        # Track best-so-far convergence
        current_best = max(e["expected_profit"] for e in evaluations)
        best_profit_so_far.append(float(current_best))

        return -e_profit  # minimize negative profit

    result = gp_minimize(
        func=objective,
        dimensions=space,
        n_calls=n_iterations + n_initial,
        n_initial_points=n_initial,
        acq_func="EI",         # Expected Improvement
        random_state=base_seed,
        noise=1e-10,
    )

    optimal_price = float(result.x[0])
    optimal_data_cap = float(result.x[1])
    max_profit = float(-result.fun)

    # Full MC at optimal point with more simulations for accurate stats
    full_mc = run_monte_carlo(
        price=optimal_price,
        data_cap=optimal_data_cap,
        params=params,
        M=M,
        base_seed=base_seed,
        n_jobs=-1,
    )

    return {
        "optimal_price": optimal_price,
        "optimal_data_cap": optimal_data_cap,
        "max_expected_profit": max_profit,
        "bo_convergence": best_profit_so_far,
        "bo_evaluations": evaluations,
        "full_mc_result": full_mc,
    }
