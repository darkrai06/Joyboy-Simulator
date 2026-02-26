"""
Monte Carlo simulation engine for telecom pricing.

Mathematical model:
- Acquisition: Logistic utility → Binomial(N0, P_join)
- Usage: Mixture lognormal (light/medium/heavy users)
- Revenue: Subscription + Overage
- Cost: sum(Xi) * c_gb
- Churn: Binomial(Nt, alpha0 + alpha1 * overage_rate)
- Profit: discounted sum over T months
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass


@dataclass
class SimParams:
    """Immutable parameter bundle passed to all simulation functions."""
    N0: int
    T: int
    discount_rate: float
    beta1: float
    beta2: float
    sigma: float
    use_mixture: bool
    mu_light: float
    sigma_light: float
    pi_light: float
    mu_medium: float
    sigma_medium: float
    pi_medium: float
    mu_heavy: float
    sigma_heavy: float
    p_over: float
    c_gb: float
    alpha0: float
    alpha1: float
    risk_lambda: float
    prospect_theory: bool
    prospect_alpha: float
    prospect_beta_pt: float
    prospect_lambda: float

    @property
    def pi_heavy(self) -> float:
        return max(0.0, 1.0 - self.pi_light - self.pi_medium)


def _value_of_data(data_cap: float) -> float:
    """Perceived value of data cap (log-saturating function)."""
    return math.log1p(data_cap)


def _prospect_utility(x: float, alpha: float, beta: float, lam: float) -> float:
    """Prospect theory utility function."""
    if x >= 0:
        return x ** alpha
    else:
        return -lam * ((-x) ** beta)


def _compute_acquisition(price: float, data_cap: float, params: SimParams, rng: np.random.Generator) -> int:
    """
    Compute initial acquired customers using logistic utility model.
    Ui = beta1 * Value(d) - beta2 * p + eps_i,  eps_i ~ N(0, sigma^2)
    P_join = 1 / (1 + exp(-Ui))
    N_acq ~ Binomial(N0, P_join)
    """
    value_d = _value_of_data(data_cap)
    utility = params.beta1 * value_d - params.beta2 * price
    eps = rng.normal(0, params.sigma)        # single draw for population mean utility
    utility += eps
    p_join = 1.0 / (1.0 + math.exp(-utility))
    p_join = max(0.001, min(0.999, p_join)) # clip
    n_acq = int(rng.binomial(params.N0, p_join))
    return n_acq


def _sample_usage(n_users: int, params: SimParams, rng: np.random.Generator) -> np.ndarray:
    """
    Sample per-user data usage (GB) from mixture lognormal.
    f(x) = pi_light * f_light(x) + pi_medium * f_medium(x) + pi_heavy * f_heavy(x)
    """
    if n_users == 0:
        return np.array([])

    if params.use_mixture:
        # Assign each user to a segment
        pis = np.array([params.pi_light, params.pi_medium, params.pi_heavy])
        pis = pis / pis.sum()     # normalize
        segments = rng.choice(3, size=n_users, p=pis)
        usage = np.empty(n_users)
        for seg_idx, (mu, sigma) in enumerate([
            (params.mu_light,  params.sigma_light),
            (params.mu_medium, params.sigma_medium),
            (params.mu_heavy,  params.sigma_heavy),
        ]):
            mask = segments == seg_idx
            if mask.any():
                usage[mask] = rng.lognormal(mu, sigma, mask.sum())
    else:
        usage = rng.lognormal(params.mu_medium, params.sigma_medium, n_users)

    return usage


def _run_single_month(
    n_active: int,
    price: float,
    data_cap: float,
    params: SimParams,
    rng: np.random.Generator,
) -> Tuple[float, float, float, int]:
    """
    Simulate one month.
    Returns: (revenue, cost, profit, n_churned)
    """
    if n_active == 0:
        return 0.0, 0.0, 0.0, 0

    usage = _sample_usage(n_active, params, rng)

    # Revenue
    r_sub = n_active * price
    overage = np.maximum(usage - data_cap, 0.0)
    r_over = float(overage.sum()) * params.p_over
    revenue = r_sub + r_over

    # Cost
    cost = float(usage.sum()) * params.c_gb

    # Churn
    overage_rate = float((usage > data_cap).mean()) if n_active > 0 else 0.0
    p_churn = params.alpha0 + params.alpha1 * overage_rate
    p_churn = max(0.0, min(1.0, p_churn))
    n_churned = int(rng.binomial(n_active, p_churn))

    profit = revenue - cost
    return revenue, cost, profit, n_churned


def run_single_simulation(
    price: float,
    data_cap: float,
    params: SimParams,
    seed: int,
) -> Dict[str, Any]:
    """
    Run a single T-month simulation. Returns per-month and total data.
    """
    rng = np.random.default_rng(seed)

    n_active = _compute_acquisition(price, data_cap, params, rng)

    monthly_profits = []
    monthly_revenues = []
    monthly_costs = []
    monthly_customers = []

    total_discounted_profit = 0.0

    for t in range(1, params.T + 1):
        revenue, cost, profit, n_churned = _run_single_month(
            n_active, price, data_cap, params, rng
        )
        discount_factor = (1 + params.discount_rate) ** t
        discounted_profit = profit / discount_factor

        total_discounted_profit += discounted_profit
        monthly_profits.append(profit)
        monthly_revenues.append(revenue)
        monthly_costs.append(cost)
        monthly_customers.append(n_active)

        # Update active customers
        n_active = max(0, n_active - n_churned)

    return {
        "total_profit": total_discounted_profit,
        "monthly_profits": monthly_profits,
        "monthly_revenues": monthly_revenues,
        "monthly_costs": monthly_costs,
        "monthly_customers": monthly_customers,
    }


def run_monte_carlo_offers(
    price: float,
    data_cap: float,
    params: SimParams,
    M: int,
    base_seed: int,
    n_jobs: int = -1,
) -> List[Dict[str, Any]]:
    """
    Generate and simulate multiple offer tiers around the anchor (price, data_cap).

    Offer tiers are built by applying multipliers to the anchor values,
    covering budget → standard → premium → unlimited-style ranges.
    Each offer is independently simulated with run_monte_carlo.

    Returns a list of offer dicts sorted by expected_profit descending.
    """
    # Define named tiers as (price_mult, cap_mult, label)
    # Price multipliers span ~0.4x to 2.5x; cap multipliers span ~0.3x to 3x
    TIER_DEFINITIONS = [
        (0.40, 0.30, "Micro"),
        (0.55, 0.50, "Budget"),
        (0.70, 0.70, "Economy"),
        (0.85, 0.85, "Basic"),
        (1.00, 1.00, "Standard"),
        (1.15, 1.30, "Plus"),
        (1.35, 1.60, "Pro"),
        (1.60, 2.00, "Elite"),
        (2.00, 2.50, "Premium"),
        (2.50, 3.00, "Unlimited"),
    ]

    offers = []
    for price_mult, cap_mult, label in TIER_DEFINITIONS:
        offer_price = round(price * price_mult, 2)
        offer_cap = round(data_cap * cap_mult, 2)

        # Skip degenerate offers
        if offer_price <= 0 or offer_cap <= 0:
            continue

        mc = run_monte_carlo(
            price=offer_price,
            data_cap=offer_cap,
            params=params,
            M=M,
            base_seed=base_seed,
            n_jobs=n_jobs,
        )

        offers.append({
            "label": label,
            "price": offer_price,
            "data_cap": offer_cap,
            "expected_profit": mc["expected_profit"],
            "risk_adjusted_profit": mc["risk_adjusted_profit"],
            "ci_lower": mc["ci_lower"],
            "ci_upper": mc["ci_upper"],
            "variance": mc["variance"],
            "std": mc["std"],
        })

    # Rank by expected profit descending
    offers.sort(key=lambda o: o["expected_profit"], reverse=True)
    return offers


def run_monte_carlo(
    price: float,
    data_cap: float,
    params: SimParams,
    M: int,
    base_seed: int,
    n_jobs: int = -1,
) -> Dict[str, Any]:
    """
    Run M Monte Carlo simulations in parallel.
    Returns statistics: E[Π], Var[Π], CI, convergence curve, samples, monthly breakdown.
    """
    from joblib import Parallel, delayed

    def _sim(i):
        return run_single_simulation(price, data_cap, params, seed=base_seed + i * 997)

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

    # Monthly breakdown (average across simulations)
    n_months = params.T
    mean_monthly_profits = []
    for t in range(n_months):
        month_profits = [r["monthly_profits"][t] for r in results]
        mean_monthly_profits.append(float(np.mean(month_profits)))

    # Short-term vs long-term
    half = n_months // 2
    short_term = float(np.mean(mean_monthly_profits[:half])) if half > 0 else 0.0
    long_term = float(np.mean(mean_monthly_profits))

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
        "mean_monthly_profits": mean_monthly_profits,
        "short_term_profit": short_term,
        "long_term_profit": long_term,
        "n_simulations_run": M,
        "seed_used": base_seed,
    }
