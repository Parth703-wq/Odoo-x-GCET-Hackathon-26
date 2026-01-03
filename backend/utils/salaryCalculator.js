/**
 * Calculate salary components based on base wage
 * Supports both fixed amounts and percentage-based calculations
 */

const calculateSalaryComponents = (baseWage, components) => {
    const calculatedComponents = [];
    let totalAllowances = 0;
    let totalDeductions = 0;

    components.forEach(component => {
        let amount = 0;

        if (component.computation_type === 'PERCENTAGE') {
            // Calculate percentage of base wage
            amount = (baseWage * component.value) / 100;
        } else {
            // Fixed amount
            amount = component.value;
        }

        calculatedComponents.push({
            ...component,
            calculated_amount: parseFloat(amount.toFixed(2))
        });

        // Categorize as allowance or deduction
        // Components like Basic, HRA, Allowances are additions
        // Components like PF, Professional Tax are deductions
        const deductionKeywords = ['pf', 'tax', 'deduction', 'esi'];
        const isDeduction = deductionKeywords.some(keyword =>
            component.component_name.toLowerCase().includes(keyword)
        );

        if (isDeduction) {
            totalDeductions += amount;
        } else {
            totalAllowances += amount;
        }
    });

    const grossSalary = baseWage + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    return {
        components: calculatedComponents,
        base_wage: parseFloat(baseWage.toFixed(2)),
        total_allowances: parseFloat(totalAllowances.toFixed(2)),
        total_deductions: parseFloat(totalDeductions.toFixed(2)),
        gross_salary: parseFloat(grossSalary.toFixed(2)),
        net_salary: parseFloat(netSalary.toFixed(2))
    };
};

/**
 * Calculate payable days based on attendance
 */
const calculatePayableDays = (totalDays, presentDays, halfDays, paidLeaveDays) => {
    return presentDays + (halfDays * 0.5) + paidLeaveDays;
};

/**
 * Calculate monthly salary based on payable days
 */
const calculateMonthlySalary = (annualSalary, payableDays, totalDaysInMonth) => {
    const dailyRate = annualSalary / 365;
    return dailyRate * payableDays;
};

module.exports = {
    calculateSalaryComponents,
    calculatePayableDays,
    calculateMonthlySalary
};
