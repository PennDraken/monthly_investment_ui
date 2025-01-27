import numpy as np

def calculate_monthly_capital(lumpsum, savings_list, rate):
    rate_frac = 1 + rate
    capital = lumpsum
    capital_monthly_history = []
    for monthly_savings in savings_list:
        for _ in range(12):
            # Monthly compund
            capital += monthly_savings
            capital = capital * rate_frac**(1/12)
            capital_monthly_history.append(capital)
    return capital_monthly_history
