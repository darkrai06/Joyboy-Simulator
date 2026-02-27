from typing import Optional, List, Dict, Literal, Union, Any, Tuple
from enum import Enum
from pydantic import (
    BaseModel,
    Field,
    conint,
    confloat,
    constr,
    validator,
    root_validator,
    PositiveInt,
    NonNegativeInt,
    NonNegativeFloat,
)
from datetime import datetime, timedelta


class NetworkType(str, Enum):
    G3 = "3G"
    G4 = "4G"
    G5 = "5G"
    WIFI = "WIFI"
    OTHER = "OTHER"


class UsageDistributionType(str, Enum):
    LOGNORMAL = "lognormal"
    GAMMA = "gamma"
    WEIBULL = "weibull"
    PARETO = "pareto"
    TRUNC_NORMAL = "truncated_normal"
    EXPONENTIAL = "exponential"
    BETA = "beta"
    NORMAL = "normal"


class OptimizationObjective(str, Enum):
    EXPECTED_PROFIT = "expected_profit"
    RISK_ADJUSTED = "risk_adjusted_profit"
    CVAR = "cvar"
    CUSTOM_METRIC = "custom_metric"


class RiskMetric(str, Enum):
    VAR = "VaR"
    CVAR = "CVaR"
    STD = "std"
    SEMIVAR = "semivariance"


class Role(str, Enum):
    ANALYST = "analyst"
    RESEARCHER = "researcher"
    PRODUCT = "product"
    ADMIN = "admin"


class Permission(str, Enum):
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    REVIEW = "review"


class Currency(str, Enum):
    BDT = "BDT"
    USD = "USD"
    EUR = "EUR"


class ExportFormat(str, Enum):
    JSON = "json"
    CSV = "csv"
    PARQUET = "parquet"
    EXCEL = "excel"


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class SamplingStrategy(str, Enum):
    IID = "iid"
    STRATIFIED = "stratified"
    IMPORTANCE = "importance"
    LATIN_HYPERCUBE = "lhs"


class FeatureFlag(BaseModel):
    name: str
    enabled: bool = False
    rollout_fraction: confloat(ge=0.0, le=1.0) = 1.0
    description: Optional[str] = None


class VersionInfo(BaseModel):
    module: str
    version: str
    commit_hash: Optional[str]
    built_at: Optional[datetime]


class UserContext(BaseModel):
    user_id: Optional[str]
    username: Optional[str]
    role: Role = Role.RESEARCHER
    permissions: List[Permission] = Field(default_factory=lambda: [Permission.READ])


class StorageLocation(BaseModel):
    bucket: Optional[str]
    path: Optional[str]
    region: Optional[str]
    uri: Optional[str]


class FileManifest(BaseModel):
    file_name: str
    size_bytes: int
    checksum: Optional[str]
    storage: Optional[StorageLocation]


class DatasetSpec(BaseModel):
    name: str
    description: Optional[str]
    source_uri: Optional[str]
    schema: Optional[Dict[str, str]]
    sample_manifest: Optional[List[FileManifest]]


class ColumnSpec(BaseModel):
    name: str
    dtype: str
    nullable: bool = True
    description: Optional[str] = None
    example: Optional[Any] = None


class DataQualityCheck(BaseModel):
    check_id: str
    description: Optional[str]
    severity: Literal["low", "medium", "high"] = "medium"
    threshold: Optional[float]
    enabled: bool = True


class Constraint(BaseModel):
    name: str
    expression: str
    description: Optional[str] = None


class ConstraintViolation(BaseModel):
    constraint_name: str
    failing_count: int
    sample_rows: Optional[List[Dict[str, Any]]]


class GovernancePolicy(BaseModel):
    policy_id: str
    name: str
    enabled: bool = True
    constraints: List[Constraint] = Field(default_factory=list)


class Consent(BaseModel):
    user_id: Optional[str]
    consented: bool = True
    scope: Optional[str]
    granted_at: Optional[datetime]


class DataRetentionPolicy(BaseModel):
    retention_days: int
    delete_after_retention: bool = True
    archival_location: Optional[StorageLocation]


class FinancialAssumptions(BaseModel):
    currency: Currency = Currency.BDT
    tax_rate: confloat(ge=0.0, le=1.0) = 0.0
    transaction_cost_pct: confloat(ge=0.0, le=1.0) = 0.0
    discount_curve: Optional[Dict[int, float]]


class DiscountCurvePoint(BaseModel):
    days: int
    discount_factor: float


class DiscountCurve(BaseModel):
    points: List[DiscountCurvePoint] = Field(default_factory=list)


class Thresholds(BaseModel):
    alert_lower_bound: Optional[float]
    alert_upper_bound: Optional[float]


class AlertDestination(BaseModel):
    name: str
    kind: Literal["email", "slack", "webhook", "pagerduty"]
    config: Dict[str, Any] = Field(default_factory=dict)


class AlertConfig(BaseModel):
    enabled: bool = False
    destinations: List[AlertDestination] = Field(default_factory=list)
    thresholds: Optional[Thresholds]


class TelemetryConfig(BaseModel):
    enabled: bool = True
    metrics: List[str] = Field(default_factory=lambda: ["cpu", "memory", "duration"])
    sampling_ms: int = 1000
    push_to: Optional[str]


class ComputeResource(BaseModel):
    provider: Optional[str]
    cpu_cores: int = 2
    memory_gb: float = 4.0
    gpu_count: int = 0
    gpu_type: Optional[str]
    max_runtime_seconds: Optional[int]


class CPUConfig(BaseModel):
    cores: int = 2
    threads_per_core: int = 1


class GPUConfig(BaseModel):
    count: int = 0
    model: Optional[str]
    memory_gb: Optional[float]


class MemoryConfig(BaseModel):
    total_gb: float = 8.0
    reserve_gb: float = 0.5


class ParallelismConfig(BaseModel):
    n_jobs: int = -1
    prefer: Literal["threads", "processes", "cloud"] = "threads"
    batch_size: Optional[int]


class ExperimentConfig(BaseModel):
    experiment_id: Optional[str]
    name: Optional[str]
    description: Optional[str]
    created_at: Optional[datetime]
    created_by: Optional[str]
    tags: List[str] = Field(default_factory=list)
    features: List[FeatureFlag] = Field(default_factory=list)
    resource: Optional[ComputeResource]
    parallelism: ParallelismConfig = Field(default_factory=ParallelismConfig)
    telemetry: TelemetryConfig = Field(default_factory=TelemetryConfig)


class Provenance(BaseModel):
    origin: Optional[str]
    executed_by: Optional[str]
    executed_at: Optional[datetime]
    version: Optional[str]
    commit: Optional[str]
    dataset_snapshot: Optional[DatasetSpec]


class SamplingPlan(BaseModel):
    strategy: SamplingStrategy = SamplingStrategy.IID
    seed: int = 42
    stratify_by: Optional[str]
    n_draws: int = 1000
    importance_weights: Optional[Dict[str, float]]


class UsageDistributionBase(BaseModel):
    type: UsageDistributionType
    weight: confloat(ge=0.0, le=1.0) = 1.0


class LogNormalParams(BaseModel):
    mu: float
    sigma: confloat(gt=0.0)
    cap: Optional[float] = 500.0


class GammaParams(BaseModel):
    shape: confloat(gt=0.0)
    scale: confloat(gt=0.0)
    cap: Optional[float] = 500.0


class WeibullParams(BaseModel):
    k: confloat(gt=0.0)
    lambda_: confloat(gt=0.0) = Field(..., alias="lambda")
    cap: Optional[float] = 500.0


class ParetoParams(BaseModel):
    alpha: confloat(gt=0.0)
    scale: confloat(gt=0.0)
    cap: Optional[float] = 500.0


class TruncatedNormalParams(BaseModel):
    mean: float
    std: confloat(gt=0.0)
    min_val: float
    max_val: float


class ExponentialParams(BaseModel):
    rate: confloat(gt=0.0)
    cap: Optional[float] = 500.0


class BetaParams(BaseModel):
    a: confloat(gt=0.0)
    b: confloat(gt=0.0)
    scale: Optional[float] = 1.0


class UsageDistributionConfig(BaseModel):
    type: UsageDistributionType
    params: Union[
        LogNormalParams,
        GammaParams,
        WeibullParams,
        ParetoParams,
        TruncatedNormalParams,
        ExponentialParams,
        BetaParams,
    ]
    weight: confloat(ge=0.0, le=1.0) = 1.0


class CustomerCohort(BaseModel):
    name: str
    fraction: confloat(gt=0.0, le=1.0)
    beta_data_multiplier: confloat(gt=0.0) = 1.0
    beta_price_multiplier: confloat(gt=0.0) = 1.0
    data_usage: UsageDistributionConfig
    voice_usage: UsageDistributionConfig
    base_renewal_rate: confloat(ge=0.0, le=1.0) = 0.6
    renewal_decay: confloat(ge=0.0) = 0.0


class CohortModel(BaseModel):
    cohorts: List[CustomerCohort]
    normalize_fractions: bool = True

    @validator("cohorts")
    def check_fractions(cls, v):
        total = sum(c.fraction for c in v)
        if total <= 0:
            raise ValueError("Sum of cohort fractions must be > 0")
        return v


class RegulatoryConstraints(BaseModel):
    min_validity_days: Optional[int]
    max_price: Optional[float]
    max_overage_rate: Optional[float]
    require_price_transparency: bool = True
    enforce_fair_usage_policy: bool = False
    max_allowed_data_cap: Optional[float]


class StressScenario(BaseModel):
    name: str
    demand_shock_multiplier: confloat(gt=0.0) = 1.0
    cost_shock_multiplier: confloat(gt=0.0) = 1.0
    churn_shock_multiplier: confloat(gt=0.0) = 1.0
    description: Optional[str] = None


class ScenarioBatch(BaseModel):
    scenarios: List[StressScenario]
    run_parallel: bool = True


class AdvancedSimulateRequest(BaseModel):
    package_label: str
    base_package: Dict[str, float]
    market_size: PositiveInt
    horizon_days: PositiveInt
    cohort_model: Optional[CohortModel]
    default_data_distribution: UsageDistributionConfig
    default_voice_distribution: UsageDistributionConfig
    risk_metric: RiskMetric = RiskMetric.STD
    risk_lambda: confloat(ge=0.0) = 0.5
    scenarios: Optional[ScenarioBatch]
    regulatory: Optional[RegulatoryConstraints]
    n_simulations: PositiveInt = 1000
    seed: int = 42
    enable_parallel: bool = True
    sampling_plan: Optional[SamplingPlan]
    experiment: Optional[ExperimentConfig]
    provenance: Optional[Provenance]


class ProfitDecomposition(BaseModel):
    base_price_revenue: float = 0.0
    data_overage_revenue: float = 0.0
    voice_overage_revenue: float = 0.0
    network_cost: float = 0.0
    voice_cost: float = 0.0
    discounting_loss: float = 0.0
    other_costs: float = 0.0

    @property
    def total_profit(self) -> float:
        return (
            self.base_price_revenue
            + self.data_overage_revenue
            + self.voice_overage_revenue
            - self.network_cost
            - self.voice_cost
            - self.discounting_loss
            - self.other_costs
        )


class AttributionScore(BaseModel):
    parameter: str
    contribution: float
    normalized_importance: confloat(ge=0.0, le=1.0) = 0.0


class ExplainabilityReport(BaseModel):
    profit_breakdown: ProfitDecomposition
    attributions: List[AttributionScore] = Field(default_factory=list)
    dominant_risk_driver: Optional[str]


class ScenarioResult(BaseModel):
    scenario_name: str
    expected_profit: float
    std: float
    downside_risk: Optional[float]


class AdvancedSimulationResponse(BaseModel):
    expected_profit: float
    std: float
    confidence_interval: Dict[str, float]
    scenario_results: Optional[List[ScenarioResult]] = None
    explainability: Optional[ExplainabilityReport] = None
    raw_samples_reference: Optional[str] = None
    execution_time_ms: Optional[float] = None
    model_version: Optional[str] = None
    engine_commit_hash: Optional[str] = None
    provenance: Optional[Provenance] = None


class OptimizationConstraint(BaseModel):
    name: str
    expression: str


class AdvancedOptimizationRequest(BaseModel):
    objective: OptimizationObjective = OptimizationObjective.EXPECTED_PROFIT
    constraints: Optional[List[OptimizationConstraint]]
    parameter_bounds: Dict[str, Tuple[float, float]]
    n_iterations: PositiveInt = 30
    n_initial: PositiveInt = 10
    simulation_template: AdvancedSimulateRequest
    parallel_evals: Optional[int] = None
    stop_on_convergence: bool = True


class ParetoFrontPoint(BaseModel):
    parameters: Dict[str, float]
    expected_profit: float
    risk_metric_value: float
    metadata: Optional[Dict[str, Any]] = None


class AdvancedOptimizationResponse(BaseModel):
    pareto_front: List[ParetoFrontPoint] = Field(default_factory=list)
    selected_solution: Optional[ParetoFrontPoint]
    convergence_trace: List[float] = Field(default_factory=list)
    total_evaluations: int = 0
    engine_version: Optional[VersionInfo] = None


class PackageDefinition(BaseModel):
    data_gb: confloat(ge=0.0) = Field(1.0)
    voice_min: confloat(ge=0.0) = Field(0.0)
    validity_days: conint(ge=1) = Field(7)
    price: confloat(ge=0.0) = Field(100.0)
    label: constr(min_length=1, max_length=80) = Field("Standard")
    currency: Currency = Currency.BDT
    tags: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class SimulateRequest(BaseModel):
    package: PackageDefinition = Field(default_factory=PackageDefinition)
    N0: PositiveInt = Field(10000)
    T_days: PositiveInt = Field(90)
    discount_rate: confloat(ge=0.0) = Field(0.01)
    beta_data: float = Field(0.5)
    beta_voice: float = Field(0.3)
    beta_price: float = Field(0.05)
    beta_validity: float = Field(0.2)
    sigma: confloat(ge=0.0) = Field(1.0)
    use_mixture: bool = Field(True)
    mu_light: float = Field(-0.5)
    sigma_light: confloat(gt=0.0) = Field(0.5)
    pi_light: confloat(ge=0.0, le=1.0) = Field(0.4)
    mu_medium: float = Field(0.5)
    sigma_medium: confloat(gt=0.0) = Field(0.6)
    pi_medium: confloat(ge=0.0, le=1.0) = Field(0.4)
    mu_heavy: float = Field(1.5)
    sigma_heavy: confloat(gt=0.0) = Field(0.7)
    mu_voice: float = Field(3.0)
    sigma_voice: confloat(gt=0.0) = Field(0.8)
    c_gb_3g: confloat(ge=0.0) = Field(2.0)
    c_gb_4g: confloat(ge=0.0) = Field(5.0)
    c_gb_5g: confloat(ge=0.0) = Field(10.0)
    pct_3g: confloat(ge=0.0, le=1.0) = Field(0.3)
    pct_4g: confloat(ge=0.0, le=1.0) = Field(0.5)
    pct_5g: confloat(ge=0.0, le=1.0) = Field(0.2)
    c_min: confloat(ge=0.0) = Field(0.5)
    p_over_data: confloat(ge=0.0) = Field(15.0)
    p_over_voice: confloat(ge=0.0) = Field(1.5)
    enable_renewal: bool = Field(True)
    base_renewal_rate: confloat(ge=0.0, le=1.0) = Field(0.6)
    renewal_decay: confloat(ge=0.0) = Field(0.05)
    n_simulations: PositiveInt = Field(1000)
    seed: int = Field(42)
    risk_lambda: confloat(ge=0.0) = Field(0.5)
    user_context: Optional[UserContext] = None
    experiment: Optional[ExperimentConfig] = None
    feature_flags: List[FeatureFlag] = Field(default_factory=list)
    provenance: Optional[Provenance] = None

    @root_validator
    def check_pct_sum(cls, values):
        p3 = values.get("pct_3g", 0.0)
        p4 = values.get("pct_4g", 0.0)
        p5 = values.get("pct_5g", 0.0)
        s = p3 + p4 + p5
        if s <= 0:
            raise ValueError("Sum of pct_3g, pct_4g, pct_5g must be > 0")
        return values


class ConfidenceInterval(BaseModel):
    lower: float
    upper: float


class SensitivityItem(BaseModel):
    parameter: str
    gradient: float
    abs_gradient: float


class PeriodProfit(BaseModel):
    period: int
    active_users: int
    revenue: float
    cost: float
    profit: float
    cumulative_profit: float
    notes: Optional[str] = None


class OfferResult(BaseModel):
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
    metadata: Optional[Dict[str, Any]] = None


class SimulationResponse(BaseModel):
    package: PackageDefinition
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    std: float
    risk_adjusted_profit: float
    profit_samples: List[float]
    profit_hist_bins: List[float]
    profit_hist_counts: List[int]
    convergence_data: List[float]
    sensitivity: List[SensitivityItem]
    period_profits: List[PeriodProfit]
    offers: List[OfferResult]
    n_simulations_run: int
    seed_used: int
    total_periods: int
    timestamps: Dict[str, datetime] = Field(default_factory=dict)
    provenance: Optional[Provenance] = None
    execution_profile: Optional[Dict[str, Any]] = None


class OptimizeRequest(BaseModel):
    packages: List[PackageDefinition] = Field(default_factory=lambda: [PackageDefinition()])
    price_min: confloat(ge=0.0) = Field(10.0)
    price_max: confloat(ge=0.0) = Field(500.0)
    data_gb_min: confloat(ge=0.0) = Field(0.0)
    data_gb_max: confloat(ge=0.0) = Field(20.0)
    voice_min_min: confloat(ge=0.0) = Field(0.0)
    voice_min_max: confloat(ge=0.0) = Field(500.0)
    validity_min: conint(ge=1) = Field(1)
    validity_max: conint(ge=1) = Field(30)
    T_months: conint(ge=1) = Field(3)
    N0: PositiveInt = Field(10000)
    T_days: PositiveInt = Field(90)
    discount_rate: confloat(ge=0.0) = Field(0.01)
    beta_data: float = Field(0.5)
    beta_voice: float = Field(0.3)
    beta_price: float = Field(0.05)
    beta_validity: float = Field(0.2)
    sigma: confloat(ge=0.0) = Field(1.0)
    use_mixture: bool = Field(True)
    mu_light: float = Field(-0.5)
    sigma_light: confloat(gt=0.0) = Field(0.5)
    pi_light: confloat(ge=0.0, le=1.0) = Field(0.4)
    mu_medium: float = Field(0.5)
    sigma_medium: confloat(gt=0.0) = Field(0.6)
    pi_medium: confloat(ge=0.0, le=1.0) = Field(0.4)
    mu_heavy: float = Field(1.5)
    sigma_heavy: confloat(gt=0.0) = Field(0.7)
    mu_voice: float = Field(3.0)
    sigma_voice: confloat(gt=0.0) = Field(0.8)
    c_gb_3g: confloat(ge=0.0) = Field(2.0)
    c_gb_4g: confloat(ge=0.0) = Field(5.0)
    c_gb_5g: confloat(ge=0.0) = Field(10.0)
    pct_3g: confloat(ge=0.0, le=1.0) = Field(0.3)
    pct_4g: confloat(ge=0.0, le=1.0) = Field(0.5)
    pct_5g: confloat(ge=0.0, le=1.0) = Field(0.2)
    c_min: confloat(ge=0.0) = Field(0.5)
    p_over_data: confloat(ge=0.0) = Field(15.0)
    p_over_voice: confloat(ge=0.0) = Field(1.5)
    enable_renewal: bool = Field(True)
    base_renewal_rate: confloat(ge=0.0, le=1.0) = Field(0.6)
    renewal_decay: confloat(ge=0.0) = Field(0.05)
    n_simulations: PositiveInt = Field(500)
    seed: int = Field(42)
    risk_lambda: confloat(ge=0.0) = Field(0.5)
    n_bo_iterations: PositiveInt = Field(30)
    n_bo_init: PositiveInt = Field(10)
    optimization_objective: OptimizationObjective = OptimizationObjective.EXPECTED_PROFIT
    constraints: Optional[List[OptimizationConstraint]] = None
    advanced_options: Optional[Dict[str, Any]] = None
    user_context: Optional[UserContext] = None
    experiment: Optional[ExperimentConfig] = None


class OptimizeResponse(BaseModel):
    optimal_package: PackageDefinition
    expected_profit: float
    confidence_interval: ConfidenceInterval
    variance: float
    std: float
    risk_adjusted_profit: float
    bo_convergence: List[float]
    bo_evaluations: List[Dict[str, Any]]
    simulation_result: SimulationResponse
    optimization_metadata: Optional[Dict[str, Any]] = None
    provenance: Optional[Provenance] = None
    selected_by: Optional[UserContext] = None


class RunSummary(BaseModel):
    run_id: str
    started_at: datetime
    finished_at: Optional[datetime]
    status: Literal["pending", "running", "failed", "completed"] = "pending"
    metrics: Optional[Dict[str, float]] = None
    errors: Optional[List[str]] = None
    experiment: Optional[ExperimentConfig] = None
    provenance: Optional[Provenance] = None


class ResourceUsage(BaseModel):
    cpu_seconds: float = 0.0
    gpu_seconds: float = 0.0
    memory_gb_seconds: float = 0.0
    io_bytes: int = 0


class ComputeMetrics(BaseModel):
    max_cpu_percent: Optional[float]
    max_memory_gb: Optional[float]
    runtime_seconds: Optional[float]
    resource_usage: Optional[ResourceUsage]


class CheckpointMeta(BaseModel):
    checkpoint_id: str
    created_at: datetime
    files: List[FileManifest] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class ExperimentResult(BaseModel):
    run_summary: RunSummary
    simulation_response: Optional[SimulationResponse]
    optimization_response: Optional[OptimizeResponse]
    advanced_simulation_response: Optional[AdvancedSimulationResponse]
    compute_metrics: Optional[ComputeMetrics]
    checkpoints: List[CheckpointMeta] = Field(default_factory=list)
    provenance: Optional[Provenance] = None


class NotificationDestination(BaseModel):
    kind: Literal["email", "slack", "webhook", "pagerduty"]
    target: str
    metadata: Optional[Dict[str, Any]] = None


class ReportSchedule(BaseModel):
    cron: Optional[str]
    every_n_hours: Optional[int]
    timezone: Optional[str]


class ReportSpec(BaseModel):
    report_id: str
    name: str
    description: Optional[str]
    recipients: List[NotificationDestination] = Field(default_factory=list)
    schedule: Optional[ReportSchedule]
    template: Optional[str]
    last_run: Optional[datetime]


class DashboardConfig(BaseModel):
    dashboard_id: str
    name: str
    widgets: List[Dict[str, Any]] = Field(default_factory=list)
    refresh_seconds: int = 60


class VisualizationHints(BaseModel):
    preferred_chart: Optional[str]
    color_palette: Optional[str]
    x_label: Optional[str]
    y_label: Optional[str]


class ModelCalibrationRequest(BaseModel):
    target_metric: str
    historical_data: DatasetSpec
    parameter_bounds: Dict[str, Tuple[float, float]]
    n_iterations: int = 100
    seed: int = 42


class CalibrationResult(BaseModel):
    calibrated_parameters: Dict[str, float]
    loss_value: float
    iterations: int
    converge: bool = False


class HistoricalDataRef(BaseModel):
    dataset: DatasetSpec
    period_start: Optional[datetime]
    period_end: Optional[datetime]
    filters: Optional[Dict[str, Any]]


class KpiDefinition(BaseModel):
    kpi_id: str
    name: str
    description: Optional[str]
    target_value: Optional[float]
    direction: Literal["higher", "lower"] = "higher"


class KpiResult(BaseModel):
    kpi: KpiDefinition
    achieved_value: float
    unit: Optional[str]
    notes: Optional[str]


class GovernanceReport(BaseModel):
    governance_policy: GovernancePolicy
    violations: List[ConstraintViolation] = Field(default_factory=list)
    passed: bool = True


class AccessControlEntry(BaseModel):
    principal: str
    permissions: List[Permission]
    resource: str


class AccessControlList(BaseModel):
    acls: List[AccessControlEntry] = Field(default_factory=list)


class AuditEvent(BaseModel):
    event_id: str
    timestamp: datetime
    user: Optional[str]
    action: str
    resource: Optional[str]
    metadata: Optional[Dict[str, Any]]


class AuditTrail(BaseModel):
    events: List[AuditEvent] = Field(default_factory=list)


class SimpleHealthCheck(BaseModel):
    name: str
    healthy: bool
    checked_at: datetime
    details: Optional[Dict[str, Any]] = None


class SystemStatus(BaseModel):
    service: str
    healthy: bool
    uptime_seconds: Optional[int]
    checks: List[SimpleHealthCheck] = Field(default_factory=list)


class WebhookConfig(BaseModel):
    url: str
    secret: Optional[str]
    enabled: bool = True
    retries: int = 3
    backoff_seconds: int = 30


class EmailConfig(BaseModel):
    smtp_server: str
    from_address: str
    port: int = 587
    username: Optional[str]
    use_tls: bool = True


class SlackConfig(BaseModel):
    webhook_url: str
    channel: Optional[str]


class PagerDutyConfig(BaseModel):
    service_key: str
    auto_resolve: bool = True


class NotificationConfig(BaseModel):
    email: Optional[EmailConfig]
    slack: Optional[SlackConfig]
    pagerduty: Optional[PagerDutyConfig]
    webhooks: List[WebhookConfig] = Field(default_factory=list)


class RunQueueItem(BaseModel):
    id: str
    enqueued_at: datetime
    payload: Dict[str, Any]
    priority: int = 5


class RunQueue(BaseModel):
    items: List[RunQueueItem] = Field(default_factory=list)


class BatchRunRequest(BaseModel):
    runs: List[AdvancedSimulateRequest]
    run_in_parallel: bool = True
    max_concurrency: Optional[int] = None
    notify_on_completion: Optional[NotificationDestination]


class BatchRunResponse(BaseModel):
    batch_id: str
    submitted_at: datetime
    estimated_completion_seconds: Optional[int]
    run_ids: List[str] = Field(default_factory=list)


class EnsembleRequest(BaseModel):
    templates: List[AdvancedSimulateRequest]
    aggregation: Literal["mean", "median", "quantile"] = "mean"
    n_members: int = 10
    seed: int = 42


class EnsembleResponse(BaseModel):
    ensemble_id: str
    aggregated_result: AdvancedSimulationResponse
    members: List[AdvancedSimulationResponse] = Field(default_factory=list)


class HealthCheckResponse(BaseModel):
    ok: bool
    timestamp: datetime
    meta: Optional[Dict[str, Any]] = None


class LightweightResult(BaseModel):
    expected_profit: float
    risk_adjusted_profit: Optional[float]
    ci_lower: Optional[float]
    ci_upper: Optional[float]


class MinimalPackageSpec(BaseModel):
    data_gb: confloat(ge=0.0)
    voice_min: confloat(ge=0.0)
    price: confloat(ge=0.0)


class ParameterSweepSpec(BaseModel):
    parameter: str
    start: float
    stop: float
    steps: int = 10


class SweepRequest(BaseModel):
    base_package: MinimalPackageSpec
    sweeps: List[ParameterSweepSpec]
    fixed_params: Optional[Dict[str, Any]] = None
    n_simulations: PositiveInt = 200
    seed: int = 42


class SweepPointResult(BaseModel):
    parameters: Dict[str, Any]
    result: LightweightResult


class SweepResponse(BaseModel):
    sweep_id: str
    points: List[SweepPointResult] = Field(default_factory=list)
    elapsed_seconds: Optional[float] = None


class CalibrationJob(BaseModel):
    job_id: str
    created_at: datetime
    status: Literal["queued", "running", "completed", "failed"] = "queued"
    metrics: Optional[Dict[str, float]] = None


class ModelArtifact(BaseModel):
    artifact_id: str
    created_at: datetime
    files: List[FileManifest] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class DeploymentConfig(BaseModel):
    name: str
    replicas: int = 1
    resources: Optional[ComputeResource]
    env: Optional[Dict[str, str]] = None


class DeployedModel(BaseModel):
    deployment: DeploymentConfig
    artifact: ModelArtifact
    health: Optional[SystemStatus]


class ExperimentArchive(BaseModel):
    experiment_id: str
    archived_at: datetime
    artifacts: List[ModelArtifact] = Field(default_factory=list)
    summary: Optional[Dict[str, Any]] = None


class CostExposure(BaseModel):
    period_days: int
    expected_cost: float
    variance: Optional[float]


class CurrencyExposure(BaseModel):
    currency: Currency
    pnl: float
    exposures: Optional[Dict[str, float]]


class FinancialReport(BaseModel):
    period_start: datetime
    period_end: datetime
    revenues: float
    costs: float
    taxes: float
    net_profit: float
    currency: Currency = Currency.BDT


class ReportDelivery(BaseModel):
    report_spec: ReportSpec
    delivered_at: Optional[datetime]
    recipients: List[NotificationDestination] = Field(default_factory=list)


class LongRunningTaskStatus(BaseModel):
    task_id: str
    status: Literal["queued", "running", "succeeded", "failed", "cancelled"]
    progress_pct: Optional[float]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    meta: Optional[Dict[str, Any]] = None