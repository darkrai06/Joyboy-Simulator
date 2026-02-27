# [SNIPPED HEADER — unchanged imports]

# ─────────────────────────────────────────────────────────────────────────────
# Distribution Framework (NEW — opt-in, default unused)
# ─────────────────────────────────────────────────────────────────────────────

class UsageDistribution:
    """Abstract base class for all usage distributions."""

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        raise NotImplementedError


@dataclass(frozen=True)
class LogNormalUsage(UsageDistribution):
    mu: float
    sigma: float
    cap: float

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])
        return np.minimum(rng.lognormal(self.mu, self.sigma, n), self.cap)


@dataclass(frozen=True)
class GammaUsage(UsageDistribution):
    shape: float
    scale: float
    cap: float

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])
        return np.minimum(rng.gamma(self.shape, self.scale, n), self.cap)


@dataclass(frozen=True)
class WeibullUsage(UsageDistribution):
    k: float
    lam: float
    cap: float

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])
        return np.minimum(rng.weibull(self.k, n) * self.lam, self.cap)


@dataclass(frozen=True)
class ParetoUsage(UsageDistribution):
    alpha: float
    scale: float
    cap: float

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])
        return np.minimum((rng.pareto(self.alpha, n) + 1) * self.scale, self.cap)


@dataclass(frozen=True)
class TruncatedNormalUsage(UsageDistribution):
    mean: float
    std: float
    min_val: float
    max_val: float

    def sample(self, n: int, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])
        x = rng.normal(self.mean, self.std, n)
        return np.clip(x, self.min_val, self.max_val)


# ─────────────────────────────────────────────────────────────────────────────
# Acquisition Model (unchanged behavior)
# ─────────────────────────────────────────────────────────────────────────────

class AcquisitionModel:
    """Encapsulates customer acquisition logic."""

    @staticmethod
    def compute(pkg: PackageSpec, params: SimParams, rng: np.random.Generator) -> int:
        utility = (
            params.beta_data * math.log1p(pkg.data_gb)
            + params.beta_voice * math.log1p(pkg.voice_min)
            + params.beta_validity * math.log(max(1, pkg.validity_days))
            - params.beta_price * pkg.price
        )
        utility += rng.normal(0, params.sigma)
        p_join = 1.0 / (1.0 + math.exp(-utility))
        p_join = max(0.001, min(0.999, p_join))
        return int(rng.binomial(params.N0, p_join))


# ─────────────────────────────────────────────────────────────────────────────
# Usage Model (existing logic preserved)
# ─────────────────────────────────────────────────────────────────────────────

class UsageModel:
    """Handles data and voice consumption sampling."""

    @staticmethod
    def sample_data(n: int, params: SimParams, rng: np.random.Generator) -> np.ndarray:
        if n == 0:
            return np.array([])

        if params.use_mixture:
            pis = np.array([params.pi_light, params.pi_medium, params.pi_heavy])
            pis = pis / pis.sum()
            segments = rng.choice(3, size=n, p=pis)
            usage = np.empty(n)

            distributions = [
                LogNormalUsage(params.mu_light, params.sigma_light, 500.0),
                LogNormalUsage(params.mu_medium, params.sigma_medium, 500.0),
                LogNormalUsage(params.mu_heavy, params.sigma_heavy, 500.0),
            ]

            for idx, dist in enumerate(distributions):
                mask = segments == idx
                if mask.any():
                    usage[mask] = dist.sample(mask.sum(), rng)
            return usage

        # Default single lognormal (unchanged)
        return LogNormalUsage(
            params.mu_medium,
            params.sigma_medium,
            500.0,
        ).sample(n, rng)

    @staticmethod
    def sample_voice(n: int, params: SimParams, rng: np.random.Generator) -> np.ndarray:
        return LogNormalUsage(
            params.mu_voice,
            params.sigma_voice,
            10_000.0,
        ).sample(n, rng)


# ─────────────────────────────────────────────────────────────────────────────
# Cost Model
# ─────────────────────────────────────────────────────────────────────────────

class CostModel:
    """Operator-side cost computation."""

    @staticmethod
    def compute_data_cost(
        usage: np.ndarray, params: SimParams, rng: np.random.Generator
    ) -> float:
        if len(usage) == 0:
            return 0.0

        pcts = np.array([params.pct_3g, params.pct_4g, params.pct_5g])
        pcts = pcts / pcts.sum()
        network = rng.choice(3, size=len(usage), p=pcts)
        costs = np.array([params.c_gb_3g, params.c_gb_4g, params.c_gb_5g])
        return float((usage * costs[network]).sum())

    @staticmethod
    def compute_voice_cost(usage: np.ndarray, params: SimParams) -> float:
        return float(usage.sum()) * params.c_min


# ─────────────────────────────────────────────────────────────────────────────
# Renewal Model
# ─────────────────────────────────────────────────────────────────────────────

class RenewalModel:
    """Customer renewal dynamics."""

    @staticmethod
    def renew(
        n_active: int,
        period: int,
        params: SimParams,
        rng: np.random.Generator,
    ) -> int:
        rate = params.base_renewal_rate - params.renewal_decay * period
        rate = max(0.70, min(1.0, rate))
        return int(rng.binomial(n_active, rate))


# ─────────────────────────────────────────────────────────────────────────────
# Risk Model
# ─────────────────────────────────────────────────────────────────────────────

class RiskModel:
    """Risk-adjusted profit metric."""

    @staticmethod
    def adjust(mean: float, std: float, params: SimParams) -> float:
        return mean - params.risk_lambda * std