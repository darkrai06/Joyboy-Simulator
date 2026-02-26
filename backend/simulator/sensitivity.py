"""
Sensitivity analysis via central finite differences.

Estimates ∂E[Π]/∂θ for each parameter θ.
"""

import math
import numpy as np
from typing import Dict, List
from dataclasses import replace

from .monte_carlo import SimParams, run_monte_carlo


def _perturb(params: SimParams, field: str, delta: float) -> SimParams:
    """Return a copy of params with one field changed by delta."""
    val = getattr(params, field)
    return replace(params, **{field: val + delta})


def compute_sensitivity(
    price: float,
    data_cap: float,
    params: SimParams,
    M: int = 300,
    base_seed: int = 42,
) -> List[Dict]:
    """
    Central-difference numerical gradient of E[Π] with respect to
    key parameters. Returns list of {parameter, gradient, abs_gradient}.
    """
    # Parameters to differentiate and their perturbation sizes
    param_deltas = {
        "price":        (price, 1.0),       # price is separate arg
        "data_cap":     (data_cap, 0.5),    # data_cap is separate arg
        "beta1":        (params.beta1,  0.01),
        "beta2":        (params.beta2,  0.005),
        "sigma":        (params.sigma,  0.05),
        "alpha0":       (params.alpha0, 0.005),
        "alpha1":       (params.alpha1, 0.05),
        "c_gb":         (params.c_gb,   0.5),
        "p_over":       (params.p_over, 1.0),
        "discount_rate":(params.discount_rate, 0.001),
    }

    def _eval(p: float, d: float, par: SimParams) -> float:
        res = run_monte_carlo(p, d, par, M, base_seed, n_jobs=1)
        return res["expected_profit"]

    results = []

    for name, (base_val, delta) in param_deltas.items():
        if name == "price":
            e_plus  = _eval(price + delta, data_cap, params)
            e_minus = _eval(price - delta, data_cap, params)
        elif name == "data_cap":
            e_plus  = _eval(price, data_cap + delta, params)
            e_minus = _eval(price, data_cap - delta, params)
        else:
            par_plus  = _perturb(params, name, delta)
            par_minus = _perturb(params, name, -delta)
            e_plus  = _eval(price, data_cap, par_plus)
            e_minus = _eval(price, data_cap, par_minus)

        gradient = (e_plus - e_minus) / (2 * delta)
        results.append({
            "parameter": name,
            "gradient": float(gradient),
            "abs_gradient": float(abs(gradient)),
        })

    # Sort by |gradient| descending
    results.sort(key=lambda x: x["abs_gradient"], reverse=True)
    return results
