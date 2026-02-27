# Joyboy Telecom Package Simulator - Gamma Presentation Prompt

## Project Overview
Create a professional presentation for a **one-time telecom package pricing simulator** built with Monte Carlo simulation and Bayesian Optimization. Focus on mathematical models, implementation details, and future roadmap.

---

## SLIDE 1: Title Slide
- **Title**: Joyboy Telecom Package Simulator
- **Subtitle**: Monte Carlo-Based Revenue Optimization for One-Time Mobile Packages
- **Team Members**:
  - Farhan Adib Avro (220041104)
  - Nayeem Hossain Ahad (220041139)
  - Md Mojadded Al Mahin (220041238)
- **Date**: February 2026
- Add a professional background with telecom/network imagery

---

## SLIDE 2: Problem Statement
- **Challenge**: How to optimize pricing for one-time telecom packages (no renewal)?
- **Key Questions**:
  - What price maximizes revenue?
  - How do data/voice allocations affect customer acquisition?
  - What is the optimal package portfolio?
- **Solution**: Data-driven simulation and optimization approach

---

## SLIDE 3: System Architecture
- Show three-layer architecture:
  1. **Frontend** (React/Vite)
     - Interactive parameter dashboard
     - Real-time visualization
     - Simulator Panel with mode selection
  2. **Backend** (FastAPI/Python)
     - Monte Carlo simulation engine
     - Bayesian Optimization module
     - Sensitivity analysis
  3. **Data Flow**: User inputs → Backend processing → Results visualization

---

## SLIDE 4: Acquisition Model (Utility Function)
**Include Formula:**
```
Utility = β_data·log(1+data_gb) + β_voice·log(1+voice_min) 
        + β_validity·log(validity_days) - β_price·price + ε

where:
  β_data = Data value sensitivity coefficient
  β_voice = Voice value sensitivity coefficient
  β_price = Price sensitivity coefficient
  β_validity = Validity period sensitivity
  ε ~ N(0, σ²) = Random noise

Probability of Purchase = sigmoid(Utility) = 1/(1+e^(-U))
Number of Customers ~ Binomial(N₀, P_join)
```

**Explanation**: Customers make purchasing decisions based on perceived utility, balancing package features against price.

---

## SLIDE 5: Data Usage Model
**Include Formula:**
```
Mixture Lognormal Model (3-segment):
  - LIGHT users (π_light fraction):
    usage ~ Lognormal(μ_light, σ_light)
  
  - MEDIUM users (π_medium fraction):
    usage ~ Lognormal(μ_medium, σ_medium)
  
  - HEAVY users (π_heavy = 1 - π_light - π_medium):
    usage ~ Lognormal(μ_heavy, σ_heavy)

Default Parameters:
  Light:  μ = -0.5, σ = 0.5  (20% of users)
  Medium: μ = 0.5,  σ = 0.6  (40% of users)
  Heavy:  μ = 1.5,  σ = 0.7  (40% of users)
```

**Purpose**: Realistically model diverse data consumption patterns

---

## SLIDE 6: Voice Usage Model
**Include Formula:**
```
Voice Usage Distribution:
  usage ~ Lognormal(μ_voice, σ_voice)

where:
  μ_voice = 3.0 (log-mean, typically ~20 minutes)
  σ_voice = 0.8 (log-standard deviation)

Why Lognormal?
  ✓ Natural right-skewed distribution
  ✓ No negative values
  ✓ Captures diverse user behaviors (light → heavy talkers)
```

---

## SLIDE 7: Network Cost Model
**Include Formula:**
```
Operator Cost Calculation:
  Total_Cost = Data_Cost + Voice_Cost

Data Delivery Cost (Network Type):
  Cost = Σ(data_usage_i × cost_per_gb_network_i)
  
  where network costs vary:
    - 3G:  ২.০ টাকা/GB (30% of users)
    - 4G:  ৫.০ টাকা/GB (50% of users)
    - 5G: ১০.০ টাকা/GB (20% of users)

Voice Delivery Cost:
  Cost = Σ(voice_minutes_i) × c_min
  where c_min = ०.५ টাকা/minute
```

**Impact**: Higher quality networks = higher delivery costs

---

## SLIDE 8: Revenue & Profit Calculation
**Include Formula:**
```
Single Period Profit Calculation:
  
  Revenue = N_active × package_price
  Cost = Network_Data_Cost + Voice_Minute_Cost
  Profit = Revenue - Cost

Discounted Profit (Time Value of Money):
  PV_Profit = Profit / (1 + discount_rate)^time_period

Key Assumption:
  - ONE-TIME purchase model
  - NO overage charging
  - NO renewal/repeat purchases
```

---

## SLIDE 9: Monte Carlo Simulation Process
**Include Algorithm:**
```
For M simulations (M = 1000 default):
  1. Acquire customers using utility model
     n_active ~ Binomial(N₀, sigmoid(Utility))
  
  2. Sample individual usage
     ∀user: data_usage ~ Data_Distribution
     ∀user: voice_usage ~ Voice_Distribution
  
  3. Assign network type to each user
     network_type ~ Categorical(3G, 4G, 5G probabilities)
  
  4. Calculate operator costs
     cost = Σ(delivery_costs) + Σ(voice_costs)
  
  5. Calculate profit
     profit = (n_active × price) - cost

Output: Distribution of profits across M simulations
  ✓ Expected value
  ✓ Standard deviation
  ✓ Confidence intervals [CI_lower, CI_upper]
  ✓ Risk-adjusted profit = E[profit] - λ×σ(profit)
```

---

## SLIDE 10: Bayesian Optimization for Pricing
**Include Concept:**
```
Objective: Maximize Expected Profit

Search Space:
  - price: [৳10 - ৳500]
  - data_gb: [0 - 20 GB]
  - voice_min: [0 - 500 minutes]
  - validity_days: [1 - 30 days]

Bayesian Optimization Process:
  1. Initialize with n_bo_init random evaluations (default: 8)
  2. Build Gaussian Process surrogate model
  3. Iteratively:
     - Select next promising point (Expected Improvement)
     - Evaluate using Monte Carlo simulation
     - Update surrogate model
  4. Repeat for n_bo_iterations (default: 20)

Result: Portfolio of optimal package tiers
  (Micro → Budget → Economy → ... → Premium)
```

---

## SLIDE 11: Sensitivity Analysis
**Include Formula:**
```
Parameter Sensitivity:
  Gradient = ∂(Expected_Profit) / ∂(Parameter)

Interpretation:
  - High gradient → Small parameter change = Large profit impact
  - Low gradient → Parameter not critical for optimization
  
Example Sensitivities:
  ✓ Price sensitivity (β_price)
  ✓ Data preference (β_data)
  ✓ Voice preference (β_voice)
  ✓ Network costs (c_gb_3g, c_gb_4g, c_gb_5g)
  ✓ Usage distribution parameters
```

---

## SLIDE 12: System Features
**Simulation Mode:**
- Single package analysis
- Full parameter control
- Risk-adjusted metrics
- Period-by-period breakdown
- Offer tier recommendations

**Optimization Mode:**
- Automatic portfolio generation
- Multi-tier package comparison
- Pareto frontier analysis
- Batch sensitivity testing

**Visualization:**
- Profit distribution histograms
- Convergence curves
- Network cost breakdowns
- Period profit trends

---

## SLIDE 13: Technology Stack
**Frontend:**
- React.js with Vite
- Lucide React for icons
- Glassmorphism UI design

**Backend:**
- FastAPI (Python web framework)
- NumPy/SciPy for numerical computing
- Scikit-Optimize for Bayesian optimization
- Pydantic for data validation

**Deployment:**
- Docker-ready architecture
- CORS enabled for frontend integration
- RESTful API endpoints

---

## SLIDE 14: API Endpoints
**POST /simulate**
```
Request: Package + market parameters
Response: 
  {
    expected_profit: float,
    confidence_interval: {lower, upper},
    variance: float,
    risk_adjusted_profit: float,
    period_profits: [{period, users, revenue, cost, profit}],
    sensitivity: [{parameter, gradient}],
    offers: [suggested package tiers]
  }
```

**POST /optimize**
```
Request: Initial packages + search ranges
Response: Optimized portfolio
  {
    packages: [optimal tier definitions],
    improvement_ratio: percentage vs baseline
  }
```

---

## SLIDE 15: Case Study / Example Scenario
**Scenario: Bangladesh Mobile Market (Standard Package)**
```
Input Parameters:
- Market size (N₀): 10,000 potential customers
- Package: 1GB data, 0 voice, 7-day validity, ৳100 price
- Simulation runs: 1,000

Expected Outputs:
- ~60% customers acquired
- Average revenue: ৳600,000
- Average cost: ৳240,000 (40% margin)
- Expected profit: ৳360,000
- Profit σ: ৳45,000
- 95% CI: [৳270K - ৳450K]
```

**What-If Analysis:**
- Increase price to ৳150 → Profit ↓ 15% (less customers)
- Increase data to 2GB → Profit ↑ 8% (higher appeal + cost)
- Increase validity to 15 days → Profit ↑ 12% (better retention perception)

---

## SLIDE 16: Key Insights
1. **Price Sensitivity**: Small price changes significantly impact customer acquisition
2. **Data Quality Matters**: Improving data allocations can offset price increases
3. **Validity Period**: Longer validity attracts customers despite no renewal
4. **Network Diversity**: 4G infrastructure provides optimal cost-quality balance
5. **Market Segmentation**: Different user cohorts require different packages

---

## SLIDE 17: Current Limitations
- ✗ Static usage patterns (no temporal trends)
- ✗ No competitive market model
- ✗ Customer churn not modeled
- ✗ No actual historical data validation
- ✗ Deterministic package bundles only

---

## SLIDE 18: Future Implementation - Phase 1
**Real Dataset Integration**
```
Goal: Validate simulation against actual market data

Implementation:
  1. Collect historical data from operators:
     - Customer acquisition rates by price point
     - Actual data/voice usage distributions
     - Network utilization metrics
     - Customer demographics
  
  2. Calibrate model parameters:
     - Use maximum likelihood estimation (MLE)
     - Bayesian parameter inference
     - Cross-validation against holdout data
  
  3. A/B testing framework:
     - Test predicted offers in real market
     - Compare actual vs simulated profits
     - Iteratively refine parameters
  
  4. Dashboard updates:
     - Add data import functionality
     - Parameter calibration tools
     - Real vs predicted comparisons
```

---

## SLIDE 19: Future Implementation - Phase 2
**Simulation Using Past Simulated Data**
```
Goal: Learn market dynamics from previous simulations

Implementation:
  1. Historical simulation repository:
     - Store all past simulation runs
     - Track outcomes (successful vs unsuccessful)
     - Build training dataset
  
  2. Meta-learning approaches:
     - ML model: Input(parameters) → Output(expected profit)
     - Train on historical simulations
     - Faster predictions without full Monte Carlo
  
  3. Ensemble methods:
     - Combine physics-based simulation with ML predictions
     - Weighted ensemble: α×simulator + (1-α)×ML_model
     - Active learning to reduce simulation costs
  
  4. Hyperparameter optimization:
     - Use past simulations to guide new searches
     - Warm-start Bayesian Optimization
     - Reduce computation time by 40-60%
```

---

## SLIDE 20: Future Implementation - Phase 3
**Advanced Features**
```
1. Multi-Operator Competition Model
   - Simulate competitor pricing strategies
   - Market share equilibrium analysis
   
2. Temporal Dynamics
   - Seasonal demand patterns
   - Network congestion effects
   - Device capability evolution
   
3. Customer Retention (Enhanced)
   - Churn prediction based on usage patterns
   - Personalized pricing strategies
   - Loyalty programs simulation
   
4. Real-time Optimization
   - Dynamic pricing based on inventory
   - Demand forecasting
   - Real-time market response
```

---

## SLIDE 21: Deliverables
✓ Full-stack application (Frontend + Backend)
✓ Monte Carlo simulation engine
✓ Bayesian Optimization framework
✓ Interactive parameter dashboard
✓ API documentation
✓ Mathematical model documentation
✓ Unit tests and validation suite
✓ Docker containerization

---

## SLIDE 22: Key Takeaways
1. **Data-Driven Pricing**: Use simulation, not guesswork
2. **Risk Quantification**: Provides confidence intervals and profit distributions
3. **Optimization at Scale**: Bayesian methods efficiently search high-dimensional space
4. **Flexible Framework**: Easily incorporate new market factors and constraints
5. **Actionable Insights**: Sensitivity analysis guides business decisions

---

## SLIDE 23: Q&A
- Leave space for questions
- Include contact information for team members
- Offer to demonstrate live simulator

---

## Design Notes for Gamma:
- Use consistent color scheme (blues, teals for tech, oranges for highlights)
- Include relevant icons/graphics for each section
- Add formula visualizations where possible
- Use comparison charts for scenario analysis
- Keep text concise with visual support
- Include Bengali currency symbol (৳) where appropriate
- Add subtle animations for formula reveals
- Color-code team member names consistently
