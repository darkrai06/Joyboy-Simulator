"""
Pydantic schemas for request/response validation.
"""
from typing import Optional, List, Tuple
from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    # Decision variables
    price: float = Field(200.0, description="Monthly subscription price (BDT)")
    data_cap: float = Field(10.0, description="Data cap in GB")

    # Market parameters
    N0: int = Field(10000, description="Market size (potential customers)")
    T: int = Field(12, description="Time horizon in months")
    discount_rate: float = Field(0.01, description="Monthly discount rate r")

    # User acquisition model (utility function)
    beta1: float = Field(0.5, description="Data value sensitivity coefficient")
    beta2: float = Field(0.05, description="Price sensitivity coefficient")
    sigma: float = Field(1.0, description="Noise std-dev in utility")

    # Usage model
    use_mixture: bool = Field(True, description="Use mixture lognormal model")
    # Light user segment
    mu_light: float = Field(1.0, description="Log-mean for light users")
    sigma_light: float = Field(0.5, description="Log-std for light users")
    pi_light: float = Field(0.4, description="Fraction of light users")
    # Medium user segment
    mu_medium: float = Field(2.0, description="Log-mean for medium users")
    sigma_medium: float = Field(0.6, description="Log-std for medium users")
    pi_medium: float = Field(0.4, description="Fraction of medium users")
    # Heavy user segment (pi_heavy = 1 - pi_light - pi_medium)
    mu_heavy: float = Field(3.0, description="Log-mean for heavy users")
    sigma_heavy: float = Field(0.7, description="Log-std for heavy users")

    # Revenue model
    p_over: float = Field(15.0, description="Overage charge per GB")

    # Cost model
    c_gb: float = Field(5.0, description="Network cost per GB delivered")

    # Churn model
    alpha0: float = Field(0.02, description="Base churn probability")
    alpha1: float = Field(0.3, description="Churn sensitivity to overage rate")

    # Simulation settings
    n_simulations: int = Field(1000, description="Number of Monte Carlo simulations M")
    seed: int = Field(42, description="RNG seed for reproducibility")
    risk_lambda: float = Field(0.5, description="Risk aversion coefficient λ")

    # Prospect theory (optional)
    prospect_theory: bool = Field(False, description="Use prospect theory utility")
    prospect_alpha: float = Field(0.88, description="Prospect theory gain exponent")
    prospect_beta_pt: float = Field(0.88, description="Prospect theory loss exponent")
    prospect_lambda: float = Field(2.25, description="Prospect theory loss aversion")


class OptimizeRequest(BaseModel):
    # Search ranges
    price_min: float = Field(50.0, description="Min price to search")
    price_max: float = Field(500.0, description="Max price to search")
    data_cap_min: float = Field(1.0, description="Min data cap (GB) to search")
    data_cap_max: float = Field(100.0, description="Max data cap (GB) to search")

    # Shared simulation params (same as SimulateRequest minus price/data_cap)
    N0: int = Field(10000)
    T: int = Field(12)
    discount_rate: float = Field(0.01)
    beta1: float = Field(0.5)
    beta2: float = Field(0.05)
    sigma: float = Field(1.0)
    use_mixture: bool = Field(True)
    mu_light: float = Field(1.0)
    sigma_light: float = Field(0.5)
    pi_light: float = Field(0.4)
    mu_medium: float = Field(2.0)
    sigma_medium: float = Field(0.6)
    pi_medium: float = Field(0.4)
    mu_heavy: float = Field(3.0)
    sigma_heavy: float = Field(0.7)
    p_over: float = Field(15.0)
    c_gb: float = Field(5.0)
    alpha0: float = Field(0.02)
    alpha1: float = Field(0.3)
    n_simulations: int = Field(500)
    seed: int = Field(42)
    risk_lambda: float = Field(0.5)
    prospect_theory: bool = Field(False)
    prospect_alpha: float = Field(0.88)
    prospect_beta_pt: float = Field(0.88)
    prospect_lambda: float = Field(2.25)

    # Bayesian optimization settings
    n_bo_iterations: int = Field(30, description="Number of BO iterations")
    n_bo_init: int = Field(10, description="Number of random initial evaluations")


class ConfidenceInterval(BaseModel):
    lower: float
    upper: float


class SensitivityItem(BaseModel):
    parameter: str
    gradient: float
    abs_gradient: float


class MonthlyProfit(BaseModel):
    month: int
    mean_profit: float
    cumulative_profit: float


class OfferResult(BaseModel):
    label: str                    # e.g. "Budget", "Standard", "Premium"
    price: float
    data_cap: float
    expected_profit: float
    risk_adjusted_profit: float
    ci_lower: float
    ci_upper: float
    variance: float
    std: float


class SimulationResponse(BaseModel):
    # Core optimal results
    optimal_price: float
    optimal_data_cap: float
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    risk_adjusted_profit: float

    # Distribution data (histogram bins)
    profit_samples: List[float]           # up to 500 samples for histogram
    profit_hist_bins: List[float]         # bin edges
    profit_hist_counts: List[int]         # bin counts

    # Convergence curve
    convergence_data: List[float]         # running mean over iterations

    # Sensitivity analysis
    sensitivity: List[SensitivityItem]

    # Short vs long-term comparison
    short_term_profit: float              # mean profit months 1..T//2
    long_term_profit: float              # mean profit full T months
    monthly_profits: List[MonthlyProfit]  # per-month breakdown

    # Multi-offer comparison (ranked by expected profit)
    offers: List[OfferResult]

    # Meta
    n_simulations_run: int
    seed_used: int


class OptimizeResponse(BaseModel):
    optimal_price: float
    optimal_data_cap: float
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    risk_adjusted_profit: float

    # BO convergence: best profit found at each BO iteration
    bo_convergence: List[float]
    # All evaluated (price, cap, profit) triples for scatter
    bo_evaluations: List[dict]

    # Full simulation result at optimal point
    simulation_result: SimulationResponse
