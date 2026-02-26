"""
Sensitivity analysis via central finite differences.

Estimates ∂E[Π]/∂θ for each parameter θ in the one-time package model.
"""

import math
import numpy as np
from typing import Dict, List
from dataclasses import replace

from .monte_carlo import SimParams, PackageSpec, run_monte_carlo


def _perturb(params: SimParams, field: str, delta: float) -> SimParams:
    """Return a copy of params with one field changed by delta."""
    val = getattr(params, field)
    return replace(params, **{field: val + delta})


def compute_sensitivity(
    pkg: PackageSpec,
    params: SimParams,
    M: int = 300,
    base_seed: int = 42,
) -> List[Dict]:
    """
    Central-difference numerical gradient of E[Π] with respect to
    key parameters. Returns list of {parameter, gradient, abs_gradient}.
    """
    # Parameters to differentiate and their perturbation sizes
    # Some are package-level (price, data_gb, etc.), some are SimParams fields
    param_deltas = {
        # Package-level
        "price":          1.0,
        "data_gb":        0.1,
        "voice_min":      5.0,
        "validity_days":  1,
        # Acquisition
        "beta_data":      0.01,
        "beta_voice":     0.01,
        "beta_price":     0.005,
        "beta_validity":  0.01,
        # Cost
        "c_gb_3g":        0.5,
        "c_gb_4g":        0.5,
        "c_gb_5g":        0.5,
        "c_min":          0.1,
        # Renewal
        "base_renewal_rate": 0.05,
    }

    def _eval(p: PackageSpec, par: SimParams) -> float:
        res = run_monte_carlo(p, par, M, base_seed, n_jobs=1)
        return res["expected_profit"]

    results = []

    for name, delta in param_deltas.items():
        if name in ("price", "data_gb", "voice_min", "validity_days"):
            # Package-level parameter
            base_val = getattr(pkg, name)

            if name == "validity_days":
                # Integer: use ±1 day
                pkg_plus = PackageSpec(
                    data_gb=pkg.data_gb, voice_min=pkg.voice_min,
                    validity_days=max(1, pkg.validity_days + 1),
                    price=pkg.price, label=pkg.label,
                )
                pkg_minus = PackageSpec(
                    data_gb=pkg.data_gb, voice_min=pkg.voice_min,
                    validity_days=max(1, pkg.validity_days - 1),
                    price=pkg.price, label=pkg.label,
                )
                e_plus = _eval(pkg_plus, params)
                e_minus = _eval(pkg_minus, params)
                gradient = (e_plus - e_minus) / 2.0
            else:
                kwargs_plus = {
                    "data_gb": pkg.data_gb, "voice_min": pkg.voice_min,
                    "validity_days": pkg.validity_days, "price": pkg.price,
                    "label": pkg.label,
                }
                kwargs_minus = dict(kwargs_plus)
                kwargs_plus[name] = base_val + delta
                kwargs_minus[name] = max(0.01, base_val - delta)
                e_plus = _eval(PackageSpec(**kwargs_plus), params)
                e_minus = _eval(PackageSpec(**kwargs_minus), params)
                gradient = (e_plus - e_minus) / (2 * delta)
        else:
            # SimParams-level parameter
            par_plus = _perturb(params, name, delta)
            par_minus = _perturb(params, name, -delta)
            e_plus = _eval(pkg, par_plus)
            e_minus = _eval(pkg, par_minus)
            gradient = (e_plus - e_minus) / (2 * delta)

        results.append({
            "parameter": name,
            "gradient": float(gradient),
            "abs_gradient": float(abs(gradient)),
        })

    # Sort by |gradient| descending
    results.sort(key=lambda x: x["abs_gradient"], reverse=True)
    return results
