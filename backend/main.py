"""
FastAPI backend for the Monte Carlo Telecom Pricing Simulator.

Endpoints:
  POST /simulate  — Run Monte Carlo at a single (price, data_cap) point
  POST /optimize  — Run Bayesian Optimization over (price, data_cap) ranges
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from simulator.models import (
    SimulateRequest,
    OptimizeRequest,
    SimulationResponse,
    OptimizeResponse,
    ConfidenceInterval,
    SensitivityItem,
    MonthlyProfit,
)
from simulator.monte_carlo import SimParams, run_monte_carlo
from simulator.bayesian_opt import bayesian_optimize
from simulator.sensitivity import compute_sensitivity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Joyboy Telecom Pricing Simulator",
    description="Monte Carlo + Bayesian Optimization for data package pricing",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _req_to_params(req) -> SimParams:
    """Build SimParams from request object (works for both request types)."""
    return SimParams(
        N0=req.N0,
        T=req.T,
        discount_rate=req.discount_rate,
        beta1=req.beta1,
        beta2=req.beta2,
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
        p_over=req.p_over,
        c_gb=req.c_gb,
        alpha0=req.alpha0,
        alpha1=req.alpha1,
        risk_lambda=req.risk_lambda,
        prospect_theory=req.prospect_theory,
        prospect_alpha=req.prospect_alpha,
        prospect_beta_pt=req.prospect_beta_pt,
        prospect_lambda=req.prospect_lambda,
    )


def _build_simulation_response(
    price: float,
    data_cap: float,
    mc: dict,
    sensitivity_data: list,
) -> SimulationResponse:
    """Convert raw MC result dict into SimulationResponse."""
    monthly = [
        MonthlyProfit(
            month=t + 1,
            mean_profit=mc["mean_monthly_profits"][t],
            cumulative_profit=sum(mc["mean_monthly_profits"][:t+1]),
        )
        for t in range(len(mc["mean_monthly_profits"]))
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
        optimal_price=price,
        optimal_data_cap=data_cap,
        expected_profit=mc["expected_profit"],
        confidence_interval=ConfidenceInterval(
            lower=mc["ci_lower"],
            upper=mc["ci_upper"],
        ),
        variance=mc["variance"],
        risk_adjusted_profit=mc["risk_adjusted_profit"],
        profit_samples=mc["profit_samples"],
        profit_hist_bins=mc["profit_hist_bins"],
        profit_hist_counts=mc["profit_hist_counts"],
        convergence_data=mc["convergence_data"],
        sensitivity=sensitivity,
        short_term_profit=mc["short_term_profit"],
        long_term_profit=mc["long_term_profit"],
        monthly_profits=monthly,
        n_simulations_run=mc["n_simulations_run"],
        seed_used=mc["seed_used"],
    )


@app.get("/")
async def root():
    return {"message": "Joyboy Telecom Pricing Simulator v2.0 — use /simulate or /optimize"}


@app.get("/api/status")
async def get_status():
    return {"status": "running", "version": "2.0.0"}


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulateRequest):
    """
    Run Monte Carlo simulation at a specific (price, data_cap).
    Also computes sensitivity analysis.
    """
    logger.info(f"[/simulate] price={req.price}, cap={req.data_cap}, M={req.n_simulations}")

    try:
        params = _req_to_params(req)

        mc_result = run_monte_carlo(
            price=req.price,
            data_cap=req.data_cap,
            params=params,
            M=req.n_simulations,
            base_seed=req.seed,
            n_jobs=-1,
        )

        # Sensitivity uses fewer simulations for speed
        sens_M = min(200, req.n_simulations)
        sensitivity_data = compute_sensitivity(
            price=req.price,
            data_cap=req.data_cap,
            params=params,
            M=sens_M,
            base_seed=req.seed,
        )

        response = _build_simulation_response(
            price=req.price,
            data_cap=req.data_cap,
            mc=mc_result,
            sensitivity_data=sensitivity_data,
        )
        logger.info(f"[/simulate] E[Π]={mc_result['expected_profit']:.2f}")
        return response

    except Exception as e:
        logger.exception("Simulation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    """
    Run Bayesian Optimization to find profit-maximizing (price, data_cap).
    """
    logger.info(
        f"[/optimize] price=[{req.price_min},{req.price_max}], "
        f"cap=[{req.data_cap_min},{req.data_cap_max}], "
        f"BO_iters={req.n_bo_iterations}"
    )

    try:
        params = _req_to_params(req)

        bo_result = bayesian_optimize(
            price_min=req.price_min,
            price_max=req.price_max,
            data_cap_min=req.data_cap_min,
            data_cap_max=req.data_cap_max,
            params=params,
            M=req.n_simulations,
            base_seed=req.seed,
            n_iterations=req.n_bo_iterations,
            n_initial=req.n_bo_init,
        )

        mc = bo_result["full_mc_result"]
        opt_price = bo_result["optimal_price"]
        opt_cap = bo_result["optimal_data_cap"]

        # Sensitivity at optimal point
        sens_M = min(200, req.n_simulations)
        sensitivity_data = compute_sensitivity(
            price=opt_price,
            data_cap=opt_cap,
            params=params,
            M=sens_M,
            base_seed=req.seed,
        )

        sim_response = _build_simulation_response(
            price=opt_price,
            data_cap=opt_cap,
            mc=mc,
            sensitivity_data=sensitivity_data,
        )

        logger.info(f"[/optimize] optimal_price={opt_price:.2f}, optimal_cap={opt_cap:.2f}, E[Π]={mc['expected_profit']:.2f}")

        return OptimizeResponse(
            optimal_price=opt_price,
            optimal_data_cap=opt_cap,
            expected_profit=mc["expected_profit"],
            confidence_interval=ConfidenceInterval(
                lower=mc["ci_lower"],
                upper=mc["ci_upper"],
            ),
            variance=mc["variance"],
            risk_adjusted_profit=mc["risk_adjusted_profit"],
            bo_convergence=bo_result["bo_convergence"],
            bo_evaluations=bo_result["bo_evaluations"],
            simulation_result=sim_response,
        )

    except Exception as e:
        logger.exception("Optimization failed")
        raise HTTPException(status_code=500, detail=str(e))