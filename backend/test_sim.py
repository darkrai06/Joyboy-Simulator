import urllib.request, json
req = urllib.request.Request('http://localhost:8000/simulate', data=json.dumps({'package':{'data_gb':1,'voice_min':0,'validity_days':7,'price':100,'label':'Standard'},'N0':10000,'T_days':90,'discount_rate':0.01,'beta_data':0.5,'beta_voice':0.3,'beta_price':0.05,'beta_validity':0.2,'sigma':1,'use_mixture':True,'mu_light':-0.5,'sigma_light':0.5,'pi_light':0.4,'mu_medium':0.5,'sigma_medium':0.6,'pi_medium':0.4,'mu_heavy':1.5,'sigma_heavy':0.7,'mu_voice':3,'sigma_voice':0.8,'c_gb_3g':2,'c_gb_4g':5,'c_gb_5g':10,'pct_3g':0.3,'pct_4g':0.5,'pct_5g':0.2,'c_min':0.5,'p_over_data':15,'p_over_voice':1.5,'enable_renewal':True,'base_renewal_rate':0.6,'renewal_decay':0.05,'n_simulations':100,'seed':42,'risk_lambda':0.5}).encode(), headers={'Content-Type': 'application/json'});
try:
  urllib.request.urlopen(req)
except Exception as e:
  print(e.read().decode())
