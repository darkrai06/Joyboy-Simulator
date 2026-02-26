"""
Monte Carlo simulation engine for one-time telecom packages.

Mathematical model:
- Acquisition: Logistic utility → Binomial(N0, P_join)
  Utility = β_data·log(1+data_gb) + β_voice·log(1+voice_min)
           + β_validity·log(validity_days) - β_price·price + ε
- Data usage: Mixture lognormal (light/medium/heavy users)
- Voice usage: Lognormal
- Revenue: N_active × price + data overage + voice overage
- Cost: network-type data cost (3G/4G/5G) + voice minute cost
- Renewal: Binomial(N_active, renewal_rate) with decay (optional)
- Profit: discounted sum over validity periods
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass


@dataclass
class SimParams:
    """Immutable parameter bundle passed to all simulation functions."""
    # Market
    N0: int
    T_days: int
    discount_rate: float

    # Acquisition
    beta_data: float
    beta_voice: float
    beta_price: float
    beta_validity: float
    sigma: float

    # Data usage
    use_mixture: bool
    mu_light: float
    sigma_light: float
    pi_light: float
    mu_medium: float
    sigma_medium: float
    pi_medium: float
    mu_heavy: float
    sigma_heavy: float

    # Voice usage
    mu_voice: float
    sigma_voice: float

    # Network costs (operator expense)
    c_gb_3g: float
    c_gb_4g: float
    c_gb_5g: float
    pct_3g: float
    pct_4g: float
    pct_5g: float
    c_min: float

    # Overage pricing
    p_over_data: float
    p_over_voice: float

    # Renewal
    enable_renewal: bool
    base_renewal_rate: float
    renewal_decay: float

    # Risk
    risk_lambda: float

    @property
    def pi_heavy(self) -> float:
        return max(0.0, 1.0 - self.pi_light - self.pi_medium)


@dataclass
class PackageSpec:
    """Lightweight package specification for simulation."""
    data_gb: float
    voice_min: float
    validity_days: int
    price: float
    label: str = "Package"


# ── Utility helpers ────────────────────────────────────────────────────────────

def _value_of_data(data_gb: float) -> float:
    """Perceived value of data allocation (log-saturating)."""
    return math.log1p(data_gb)


def _value_of_voice(voice_min: float) -> float:
    """Perceived value of voice minutes (log-saturating)."""
    return math.log1p(voice_min)


def _compute_acquisition(
    pkg: PackageSpec,
    params: SimParams,
    rng: np.random.Generator,
) -> int:
    """
    Compute initial buyers using logistic utility model.
    U = β_data·V(data) + β_voice·V(voice) + β_validity·log(validity) - β_price·price + ε
    P_join = sigmoid(U)
    N_buyers ~ Binomial(N0, P_join)
    """
    utility = (
        params.beta_data * _value_of_data(pkg.data_gb)
        + params.beta_voice * _value_of_voice(pkg.voice_min)
        + params.beta_validity * math.log(max(1, pkg.validity_days))
        - params.beta_price * pkg.price
    )
    eps = rng.normal(0, params.sigma)
    utility += eps
    p_join = 1.0 / (1.0 + math.exp(-utility))
    p_join = max(0.001, min(0.999, p_join))
    return int(rng.binomial(params.N0, p_join))


# ── Usage sampling ─────────────────────────────────────────────────────────────

def _sample_data_usage(n_users: int, params: SimParams, rng: np.random.Generator) -> np.ndarray:
    """
    Sample per-user data usage (GB) from mixture lognormal.
    Represents how much data each user actually consumes during the validity period.
    """
    if n_users == 0:
        return np.array([])

    if params.use_mixture:
        pis = np.array([params.pi_light, params.pi_medium, params.pi_heavy])
        pis = pis / pis.sum()
        segments = rng.choice(3, size=n_users, p=pis)
        usage = np.empty(n_users)
        for seg_idx, (mu, sigma) in enumerate([
            (params.mu_light, params.sigma_light),
            (params.mu_medium, params.sigma_medium),
            (params.mu_heavy, params.sigma_heavy),
        ]):
            mask = segments == seg_idx
            if mask.any():
                usage[mask] = rng.lognormal(mu, sigma, mask.sum())
    else:
        usage = rng.lognormal(params.mu_medium, params.sigma_medium, n_users)

    return usage


def _sample_voice_usage(n_users: int, params: SimParams, rng: np.random.Generator) -> np.ndarray:
    """Sample per-user voice usage (minutes) from lognormal."""
    if n_users == 0:
        return np.array([])
    return rng.lognormal(params.mu_voice, params.sigma_voice, n_users)


# ── Network cost computation ──────────────────────────────────────────────────

def _compute_network_data_cost(
    data_usage: np.ndarray,
    params: SimParams,
    rng: np.random.Generator,
) -> float:
    """
    Compute operator's cost to deliver data, accounting for network type.
    Each user is assigned to 3G/4G/5G; cost per GB varies by network.
    """
    n_users = len(data_usage)
    if n_users == 0:
        return 0.0

    # Assign each user to a network type
    pcts = np.array([params.pct_3g, params.pct_4g, params.pct_5g])
    pcts = pcts / pcts.sum()
    network_types = rng.choice(3, size=n_users, p=pcts)

    costs_per_gb = np.array([params.c_gb_3g, params.c_gb_4g, params.c_gb_5g])
    per_user_cost = data_usage * costs_per_gb[network_types]
    return float(per_user_cost.sum())


# ── Single validity period simulation ─────────────────────────────────────────

def _run_single_period(
    n_active: int,
    pkg: PackageSpec,
    params: SimParams,
    rng: np.random.Generator,
) -> Tuple[float, float, float, int]:
    """
    Simulate one validity period (one package lifecycle).
    Returns: (revenue, cost, profit, n_active_after_renewal)
    """
    if n_active == 0:
        return 0.0, 0.0, 0.0, 0

    # ── Revenue ──
    # Base: every active user pays the package price
    r_package = n_active * pkg.price

    # Data overage
    r_data_overage = 0.0
    data_usage = np.array([])
    if pkg.data_gb > 0:
        data_usage = _sample_data_usage(n_active, params, rng)
        data_overage = np.maximum(data_usage - pkg.data_gb, 0.0)
        r_data_overage = float(data_overage.sum()) * params.p_over_data
    else:
        # Data-only: no data in package, but users don't use data either
        data_usage = np.zeros(n_active)

    # Voice overage
    r_voice_overage = 0.0
    voice_usage = np.array([])
    if pkg.voice_min > 0:
        voice_usage = _sample_voice_usage(n_active, params, rng)
        voice_overage = np.maximum(voice_usage - pkg.voice_min, 0.0)
        r_voice_overage = float(voice_overage.sum()) * params.p_over_voice
    else:
        voice_usage = np.zeros(n_active)

    revenue = r_package + r_data_overage + r_voice_overage

    # ── Cost (operator expense) ──
    # Data delivery cost (varies by network type)
    data_cost = _compute_network_data_cost(data_usage, params, rng)

    # Voice cost
    voice_cost = float(voice_usage.sum()) * params.c_min

    cost = data_cost + voice_cost

    # ── Profit ──
    profit = revenue - cost

    return revenue, cost, profit, n_active


# ── Single simulation run ─────────────────────────────────────────────────────

def run_single_simulation(
    pkg: PackageSpec,
    params: SimParams,
    seed: int,
) -> Dict[str, Any]:
    """
    Run a single simulation over the full time horizon.
    The horizon is divided into validity periods (T_days / validity_days).
    After each period, users may renew (if enabled).
    """
    rng = np.random.default_rng(seed)

    # Initial acquisition
    n_active = _compute_acquisition(pkg, params, rng)

    # Calculate number of validity periods
    if params.enable_renewal:
        n_periods = max(1, params.T_days // max(1, pkg.validity_days))
    else:
        n_periods = 1  # Just one purchase cycle

    period_data = []
    total_discounted_profit = 0.0
    cumulative_profit = 0.0

    for period_idx in range(n_periods):
        revenue, cost, profit, _ = _run_single_period(
            n_active, pkg, params, rng
        )

        # Discount factor based on days elapsed
        days_elapsed = (period_idx + 1) * pkg.validity_days
        discount_factor = (1 + params.discount_rate) ** days_elapsed
        discounted_profit = profit / discount_factor
        total_discounted_profit += discounted_profit
        cumulative_profit += profit

        period_data.append({
            "period": period_idx + 1,
            "active_users": n_active,
            "revenue": revenue,
            "cost": cost,
            "profit": profit,
            "cumulative_profit": cumulative_profit,
        })

        # Renewal (if enabled and not last period)
        if params.enable_renewal and period_idx < n_periods - 1:
            renewal_rate = max(
                0.0,
                params.base_renewal_rate - params.renewal_decay * period_idx
            )
            renewal_rate = min(1.0, renewal_rate)
            n_active = int(rng.binomial(n_active, renewal_rate))
            if n_active == 0:
                break

    return {
        "total_profit": total_discounted_profit,
        "period_data": period_data,
        "n_periods": len(period_data),
    }


# ── Multi-offer tier comparison ───────────────────────────────────────────────

def run_monte_carlo_offers(
    pkg: PackageSpec,
    params: SimParams,
    M: int,
    base_seed: int,
    n_jobs: int = -1,
) -> List[Dict[str, Any]]:
    """
    Generate and simulate multiple offer tiers around the anchor package.
    Varies price, data_gb, voice_min, and validity_days.
    Returns a list of offer dicts sorted by expected_profit descending.
    """
    TIER_DEFINITIONS = [
        (0.40, 0.30, 0.30, 0.5,  "Micro"),
        (0.55, 0.50, 0.50, 0.5,  "Budget"),
        (0.70, 0.70, 0.70, 1.0,  "Economy"),
        (0.85, 0.85, 0.85, 1.0,  "Basic"),
        (1.00, 1.00, 1.00, 1.0,  "Standard"),
        (1.15, 1.30, 1.30, 1.0,  "Plus"),
        (1.35, 1.60, 1.60, 2.0,  "Pro"),
        (1.60, 2.00, 2.00, 2.0,  "Elite"),
        (2.00, 2.50, 2.50, 4.0,  "Premium"),
        (2.50, 3.00, 3.00, 4.0,  "Unlimited"),
    ]

    offers = []
    for price_mult, data_mult, voice_mult, validity_mult, label in TIER_DEFINITIONS:
        offer_price = round(pkg.price * price_mult, 2)
        offer_data = round(pkg.data_gb * data_mult, 2)
        offer_voice = round(pkg.voice_min * voice_mult, 2)
        offer_validity = max(1, int(pkg.validity_days * validity_mult))

        if offer_price <= 0:
            continue

        offer_pkg = PackageSpec(
            data_gb=offer_data,
            voice_min=offer_voice,
            validity_days=offer_validity,
            price=offer_price,
            label=label,
        )

        mc = run_monte_carlo(
            pkg=offer_pkg,
            params=params,
            M=M,
            base_seed=base_seed,
            n_jobs=n_jobs,
        )

        offers.append({
            "label": label,
            "data_gb": offer_data,
            "voice_min": offer_voice,
            "validity_days": offer_validity,
            "price": offer_price,
            "expected_profit": mc["expected_profit"],
            "risk_adjusted_profit": mc["risk_adjusted_profit"],
            "ci_lower": mc["ci_lower"],
            "ci_upper": mc["ci_upper"],
            "variance": mc["variance"],
            "std": mc["std"],
        })

    offers.sort(key=lambda o: o["expected_profit"], reverse=True)
    return offers


# ── Main Monte Carlo runner ───────────────────────────────────────────────────

def run_monte_carlo(
    pkg: PackageSpec,
    params: SimParams,
    M: int,
    base_seed: int,
    n_jobs: int = -1,
) -> Dict[str, Any]:
    """
    Run M Monte Carlo simulations in parallel.
    Returns statistics: E[Π], Var[Π], CI, convergence curve, samples,
    period breakdown.
    """
    from joblib import Parallel, delayed

    def _sim(i):
        return run_single_simulation(pkg, params, seed=base_seed + i * 997)

    results = Parallel(n_jobs=n_jobs, prefer="threads")(
        delayed(_sim)(i) for i in range(M)
    )

    profit_samples = np.array([r["total_profit"] for r in results])

    # Statistics
    mean_profit = float(profit_samples.mean())
    var_profit = float(profit_samples.var())
    std_profit = float(profit_samples.std())
    ci_half = 1.96 * std_profit / math.sqrt(M)
    ci_lower = mean_profit - ci_half
    ci_upper = mean_profit + ci_half
    risk_adjusted = mean_profit - params.risk_lambda * var_profit

    # Convergence curve (running mean)
    convergence = [float(profit_samples[:i+1].mean()) for i in range(len(profit_samples))]

    # Histogram (50 bins)
    counts, bin_edges = np.histogram(profit_samples, bins=50)

    # Period breakdown (average across simulations)
    max_periods = max(r["n_periods"] for r in results)
    mean_period_data = []
    for p in range(max_periods):
        period_revenues = []
        period_costs = []
        period_profits = []
        period_users = []
        period_cum_profits = []
        for r in results:
            if p < len(r["period_data"]):
                pd = r["period_data"][p]
                period_revenues.append(pd["revenue"])
                period_costs.append(pd["cost"])
                period_profits.append(pd["profit"])
                period_users.append(pd["active_users"])
                period_cum_profits.append(pd["cumulative_profit"])

        if period_profits:
            mean_period_data.append({
                "period": p + 1,
                "active_users": int(np.mean(period_users)),
                "revenue": float(np.mean(period_revenues)),
                "cost": float(np.mean(period_costs)),
                "profit": float(np.mean(period_profits)),
                "cumulative_profit": float(np.mean(period_cum_profits)),
            })

    # Profit samples (cap at 2000 for response size)
    sample_export = profit_samples[:2000].tolist()

    return {
        "expected_profit": mean_profit,
        "variance": var_profit,
        "std": std_profit,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "risk_adjusted_profit": risk_adjusted,
        "profit_samples": sample_export,
        "profit_hist_counts": counts.tolist(),
        "profit_hist_bins": bin_edges.tolist(),
        "convergence_data": convergence,
        "mean_period_data": mean_period_data,
        "total_periods": max_periods,
        "n_simulations_run": M,
        "seed_used": base_seed,
    }
