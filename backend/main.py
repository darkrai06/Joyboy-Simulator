"""
FastAPI backend for the One-Time Telecom Package Simulator.

Endpoints:
  POST /simulate  — Run Monte Carlo simulation for a single package
  POST /optimize  — Run Bayesian Optimization to find the best package params
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from simulator.models import (
    PackageDefinition,
    SimulateRequest,
    OptimizeRequest,
    SimulationResponse,
    OptimizeResponse,
    ConfidenceInterval,
    SensitivityItem,
    PeriodProfit,
    OfferResult,
)
from simulator.monte_carlo import SimParams, PackageSpec, run_monte_carlo, run_monte_carlo_offers
from simulator.bayesian_opt import bayesian_optimize
from simulator.sensitivity import compute_sensitivity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Joyboy Telecom Package Simulator",
    description="Monte Carlo + Bayesian Optimization for one-time data/voice packages",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _req_to_params(req) -> SimParams:
    """Build SimParams from request object."""
    return SimParams(
        N0=req.N0,
        T_days=req.T_days,
        discount_rate=req.discount_rate,
        beta_data=req.beta_data,
        beta_voice=req.beta_voice,
        beta_price=req.beta_price,
        beta_validity=req.beta_validity,
        sigma=req.sigma,
        use_mixture=req.use_mixture,
        mu_light=req.mu_light,
        sigma_light=req.sigma_light,
        pi_light=req.pi_light,
        mu_medium=req.mu_medium,
        sigma_medium=req.sigma_medium,
        pi_medium=req.pi_medium,
        mu_heavy=req.mu_heavy,
        sigma_heavy=req.sigma_heavy,
        mu_voice=req.mu_voice,
        sigma_voice=req.sigma_voice,
        c_gb_3g=req.c_gb_3g,
        c_gb_4g=req.c_gb_4g,
        c_gb_5g=req.c_gb_5g,
        pct_3g=req.pct_3g,
        pct_4g=req.pct_4g,
        pct_5g=req.pct_5g,
        c_min=req.c_min,
        p_over_data=req.p_over_data,
        p_over_voice=req.p_over_voice,
        enable_renewal=req.enable_renewal,
        base_renewal_rate=req.base_renewal_rate,
        renewal_decay=req.renewal_decay,
        risk_lambda=req.risk_lambda,
    )


def _pkg_to_spec(pkg: PackageDefinition) -> PackageSpec:
    """Convert Pydantic PackageDefinition to PackageSpec dataclass."""
    return PackageSpec(
        data_gb=pkg.data_gb,
        voice_min=pkg.voice_min,
        validity_days=pkg.validity_days,
        price=pkg.price,
        label=pkg.label,
    )


def _spec_to_def(spec: PackageSpec) -> PackageDefinition:
    """Convert PackageSpec dataclass to Pydantic PackageDefinition."""
    return PackageDefinition(
        data_gb=spec.data_gb,
        voice_min=spec.voice_min,
        validity_days=spec.validity_days,
        price=spec.price,
        label=spec.label,
    )


def _build_simulation_response(
    pkg: PackageDefinition,
    mc: dict,
    sensitivity_data: list,
    offers: list,
) -> SimulationResponse:
    """Convert raw MC result dict into SimulationResponse."""
    period_profits = [
        PeriodProfit(
            period=pd["period"],
            active_users=pd["active_users"],
            revenue=pd["revenue"],
            cost=pd["cost"],
            profit=pd["profit"],
            cumulative_profit=pd["cumulative_profit"],
        )
        for pd in mc["mean_period_data"]
    ]

    sensitivity = [
        SensitivityItem(
            parameter=s["parameter"],
            gradient=s["gradient"],
            abs_gradient=s["abs_gradient"],
        )
        for s in sensitivity_data
    ]

    return SimulationResponse(
        package=pkg,
        expected_profit=mc["expected_profit"],
        confidence_interval=ConfidenceInterval(
            lower=mc["ci_lower"],
            upper=mc["ci_upper"],
        ),
        variance=mc["variance"],
        std=mc["std"],
        risk_adjusted_profit=mc["risk_adjusted_profit"],
        profit_samples=mc["profit_samples"],
        profit_hist_bins=mc["profit_hist_bins"],
        profit_hist_counts=mc["profit_hist_counts"],
        convergence_data=mc["convergence_data"],
        sensitivity=sensitivity,
        period_profits=period_profits,
        offers=[
            OfferResult(
                label=o["label"],
                data_gb=o["data_gb"],
                voice_min=o["voice_min"],
                validity_days=o["validity_days"],
                price=o["price"],
                expected_profit=o["expected_profit"],
                risk_adjusted_profit=o["risk_adjusted_profit"],
                ci_lower=o["ci_lower"],
                ci_upper=o["ci_upper"],
                variance=o["variance"],
                std=o["std"],
            )
            for o in offers
        ],
        n_simulations_run=mc["n_simulations_run"],
        seed_used=mc["seed_used"],
        total_periods=mc["total_periods"],
    )


@app.get("/")
async def root():
    return {"message": "Joyboy Telecom Package Simulator v3.0 — use /simulate or /optimize"}


@app.get("/api/status")
async def get_status():
    return {"status": "running", "version": "3.0.0"}


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulateRequest):
    """
    Run Monte Carlo simulation for a single one-time package.
    Also computes sensitivity analysis and multi-offer comparison.
    """
    pkg_def = req.package
    logger.info(
        f"[/simulate] {pkg_def.label}: {pkg_def.data_gb}GB, "
        f"{pkg_def.voice_min}min, {pkg_def.validity_days}d, "
        f"৳{pkg_def.price}, M={req.n_simulations}"
    )

    try:
        params = _req_to_params(req)
        pkg_spec = _pkg_to_spec(pkg_def)

        mc_result = run_monte_carlo(
            pkg=pkg_spec,
            params=params,
            M=req.n_simulations,
            base_seed=req.seed,
            n_jobs=-1,
        )

        # Sensitivity (uses fewer simulations for speed)
        sens_M = min(200, req.n_simulations)
        sensitivity_data = compute_sensitivity(
            pkg=pkg_spec,
            params=params,
            M=sens_M,
            base_seed=req.seed,
        )

        # Multi-offer comparison
        offers_data = run_monte_carlo_offers(
            pkg=pkg_spec,
            params=params,
            M=max(100, req.n_simulations // 5),
            base_seed=req.seed,
            n_jobs=-1,
        )

        response = _build_simulation_response(
            pkg=pkg_def,
            mc=mc_result,
            sensitivity_data=sensitivity_data,
            offers=offers_data,
        )

        logger.info(f"[/simulate] E[Π]={mc_result['expected_profit']:.2f}")
        return response

    except Exception as e:
        logger.exception("Simulation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    """
    Run Bayesian Optimization to find profit-maximizing package parameters.
    """
    logger.info(
        f"[/optimize] {len(req.packages)} packages, "
        f"price=[{req.price_min},{req.price_max}], "
        f"data=[{req.data_gb_min},{req.data_gb_max}]GB, "
        f"voice=[{req.voice_min_min},{req.voice_min_max}]min, "
        f"validity=[{req.validity_min},{req.validity_max}]d, "
        f"BO_iters={req.n_bo_iterations}"
    )

    try:
        params = _req_to_params(req)
        pkg_specs = [_pkg_to_spec(p) for p in req.packages]

        bo_result = bayesian_optimize(
            packages=pkg_specs,
            price_min=req.price_min,
            price_max=req.price_max,
            data_gb_min=req.data_gb_min,
            data_gb_max=req.data_gb_max,
            voice_min_min=req.voice_min_min,
            voice_min_max=req.voice_min_max,
            validity_min=req.validity_min,
            validity_max=req.validity_max,
            params=params,
            M=req.n_simulations,
            base_seed=req.seed,
            n_iterations=req.n_bo_iterations,
            n_initial=req.n_bo_init,
        )

        mc = bo_result["full_mc_result"]
        optimal_pkg = bo_result["optimal_package"]
        optimal_pkg_def = _spec_to_def(optimal_pkg)

        # Sensitivity at optimal point
        sens_M = min(200, req.n_simulations)
        sensitivity_data = compute_sensitivity(
            pkg=optimal_pkg,
            params=params,
            M=sens_M,
            base_seed=req.seed,
        )

        sim_response = _build_simulation_response(
            pkg=optimal_pkg_def,
            mc=mc,
            sensitivity_data=sensitivity_data,
            offers=bo_result.get("offers", []),
        )

        logger.info(
            f"[/optimize] optimal: {optimal_pkg.data_gb}GB, "
            f"{optimal_pkg.voice_min}min, {optimal_pkg.validity_days}d, "
            f"৳{optimal_pkg.price:.2f}, E[Π]={mc['expected_profit']:.2f}"
        )

        return OptimizeResponse(
            optimal_package=optimal_pkg_def,
            expected_profit=mc["expected_profit"],
            confidence_interval=ConfidenceInterval(
                lower=mc["ci_lower"],
                upper=mc["ci_upper"],
            ),
            variance=mc["variance"],
            std=mc["std"],
            risk_adjusted_profit=mc["risk_adjusted_profit"],
            bo_convergence=bo_result["bo_convergence"],
            bo_evaluations=bo_result["bo_evaluations"],
            simulation_result=sim_response,
        )

    except Exception as e:
        logger.exception("Optimization failed")
        raise HTTPException(status_code=500, detail=str(e))