"""
Pydantic schemas for request/response validation.

One-time telecom package model:
  - PackageDefinition: data_gb, voice_min, validity_days, price
  - Network-type cost model (3G/4G/5G)
  - Optional renewal (repeat purchase) behavior
"""
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Package Definition ─────────────────────────────────────────────────────────

class PackageDefinition(BaseModel):
    """A single one-time telecom package."""
    data_gb: float = Field(1.0, description="Data allocation in GB (0 = no data)")
    voice_min: float = Field(0.0, description="Voice minutes included (0 = no voice)")
    validity_days: int = Field(7, description="Package validity in days")
    price: float = Field(100.0, description="One-time price in BDT")
    label: str = Field("Standard", description="Package label / name")


# ── Simulate Request ───────────────────────────────────────────────────────────

class SimulateRequest(BaseModel):
    """Run Monte Carlo simulation for a single one-time package."""

    # Package
    package: PackageDefinition = Field(default_factory=PackageDefinition)

    # Market parameters
    N0: int = Field(10000, description="Market size (potential customers)")
    T_days: int = Field(90, description="Simulation horizon in days")
    discount_rate: float = Field(0.01, description="Daily discount rate")

    # Acquisition model (utility function)
    beta_data: float = Field(0.5, description="Data value sensitivity coefficient")
    beta_voice: float = Field(0.3, description="Voice value sensitivity coefficient")
    beta_price: float = Field(0.05, description="Price sensitivity coefficient")
    beta_validity: float = Field(0.2, description="Validity sensitivity coefficient")
    sigma: float = Field(1.0, description="Noise std-dev in utility")

    # Data usage model (mixture lognormal)
    use_mixture: bool = Field(True, description="Use mixture lognormal data usage model")
    mu_light: float = Field(-0.5, description="Log-mean for light data users (GB)")
    sigma_light: float = Field(0.5, description="Log-std for light data users")
    pi_light: float = Field(0.4, description="Fraction of light data users")
    mu_medium: float = Field(0.5, description="Log-mean for medium data users (GB)")
    sigma_medium: float = Field(0.6, description="Log-std for medium data users")
    pi_medium: float = Field(0.4, description="Fraction of medium data users")
    mu_heavy: float = Field(1.5, description="Log-mean for heavy data users (GB)")
    sigma_heavy: float = Field(0.7, description="Log-std for heavy data users")

    # Voice usage model (single lognormal)
    mu_voice: float = Field(3.0, description="Log-mean for voice usage (minutes)")
    sigma_voice: float = Field(0.8, description="Log-std for voice usage")

    # Network cost model (operator's cost to deliver service)
    c_gb_3g: float = Field(2.0, description="Operator cost per GB on 3G (BDT)")
    c_gb_4g: float = Field(5.0, description="Operator cost per GB on 4G (BDT)")
    c_gb_5g: float = Field(10.0, description="Operator cost per GB on 5G (BDT)")
    pct_3g: float = Field(0.3, description="Fraction of users on 3G")
    pct_4g: float = Field(0.5, description="Fraction of users on 4G")
    pct_5g: float = Field(0.2, description="Fraction of users on 5G")
    c_min: float = Field(0.5, description="Operator cost per voice minute (BDT)")

    # Overage pricing (charged to user)
    p_over_data: float = Field(15.0, description="Overage charge per GB to user (BDT)")
    p_over_voice: float = Field(1.5, description="Overage charge per minute to user (BDT)")

    # Renewal model
    enable_renewal: bool = Field(True, description="Enable repeat purchase / renewal")
    base_renewal_rate: float = Field(0.6, description="Base renewal probability after expiry")
    renewal_decay: float = Field(0.05, description="Renewal rate decay per cycle")

    # Simulation settings
    n_simulations: int = Field(1000, description="Number of Monte Carlo simulations M")
    seed: int = Field(42, description="RNG seed for reproducibility")
    risk_lambda: float = Field(0.5, description="Risk aversion coefficient λ")


# ── Optimize Request ───────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    """Run Bayesian Optimization to find revenue-maximizing package portfolio."""

    # Initial portfolio
    packages: List[PackageDefinition] = Field(
        default_factory=lambda: [PackageDefinition()],
        description="Initial package portfolio (BO will optimize parameters)",
    )

    # Search ranges per package dimension
    price_min: float = Field(10.0, description="Min price to search (BDT)")
    price_max: float = Field(500.0, description="Max price to search (BDT)")
    data_gb_min: float = Field(0.0, description="Min data GB to search")
    data_gb_max: float = Field(20.0, description="Max data GB to search")
    voice_min_min: float = Field(0.0, description="Min voice minutes to search")
    voice_min_max: float = Field(500.0, description="Max voice minutes to search")
    validity_min: int = Field(1, description="Min validity days to search")
    validity_max: int = Field(30, description="Max validity days to search")

    # Portfolio horizon
    T_months: int = Field(3, description="Portfolio optimization horizon in months")

    # Shared simulation params (same as SimulateRequest)
    N0: int = Field(10000)
    T_days: int = Field(90)
    discount_rate: float = Field(0.01)

    beta_data: float = Field(0.5)
    beta_voice: float = Field(0.3)
    beta_price: float = Field(0.05)
    beta_validity: float = Field(0.2)
    sigma: float = Field(1.0)

    use_mixture: bool = Field(True)
    mu_light: float = Field(-0.5)
    sigma_light: float = Field(0.5)
    pi_light: float = Field(0.4)
    mu_medium: float = Field(0.5)
    sigma_medium: float = Field(0.6)
    pi_medium: float = Field(0.4)
    mu_heavy: float = Field(1.5)
    sigma_heavy: float = Field(0.7)

    mu_voice: float = Field(3.0)
    sigma_voice: float = Field(0.8)

    c_gb_3g: float = Field(2.0)
    c_gb_4g: float = Field(5.0)
    c_gb_5g: float = Field(10.0)
    pct_3g: float = Field(0.3)
    pct_4g: float = Field(0.5)
    pct_5g: float = Field(0.2)
    c_min: float = Field(0.5)

    p_over_data: float = Field(15.0)
    p_over_voice: float = Field(1.5)

    enable_renewal: bool = Field(True)
    base_renewal_rate: float = Field(0.6)
    renewal_decay: float = Field(0.05)

    n_simulations: int = Field(500)
    seed: int = Field(42)
    risk_lambda: float = Field(0.5)

    # Bayesian optimization settings
    n_bo_iterations: int = Field(30, description="Number of BO iterations")
    n_bo_init: int = Field(10, description="Number of random initial evaluations")


# ── Response Models ────────────────────────────────────────────────────────────

class ConfidenceInterval(BaseModel):
    lower: float
    upper: float


class SensitivityItem(BaseModel):
    parameter: str
    gradient: float
    abs_gradient: float


class PeriodProfit(BaseModel):
    """Profit data for one validity period (renewal cycle)."""
    period: int
    active_users: int
    revenue: float
    cost: float
    profit: float
    cumulative_profit: float


class OfferResult(BaseModel):
    """Result for a single package offer tier."""
    label: str
    data_gb: float
    voice_min: float
    validity_days: int
    price: float
    expected_profit: float
    risk_adjusted_profit: float
    ci_lower: float
    ci_upper: float
    variance: float
    std: float


class SimulationResponse(BaseModel):
    """Response for POST /simulate."""

    # Input package echo
    package: PackageDefinition

    # Core results
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    std: float
    risk_adjusted_profit: float

    # Distribution data
    profit_samples: List[float]
    profit_hist_bins: List[float]
    profit_hist_counts: List[int]

    # Convergence curve
    convergence_data: List[float]

    # Sensitivity analysis
    sensitivity: List[SensitivityItem]

    # Per-period breakdown
    period_profits: List[PeriodProfit]

    # Multi-offer comparison
    offers: List[OfferResult]

    # Meta
    n_simulations_run: int
    seed_used: int
    total_periods: int


class OptimizeResponse(BaseModel):
    """Response for POST /optimize."""

    # Optimal package found
    optimal_package: PackageDefinition
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    std: float
    risk_adjusted_profit: float

    # BO convergence
    bo_convergence: List[float]
    bo_evaluations: List[dict]

    # Full simulation result at optimal point
    simulation_result: SimulationResponse
