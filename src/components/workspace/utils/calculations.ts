// Formula calculation utilities
import { WorkspaceTask } from '../types';

export class FormulaCalculator {
  /**
   * Calculate formula for a given task
   */
  static calculate(formula: string, task: WorkspaceTask): number | string {
    try {
      // Basic arithmetic operations
      if (formula.includes('+') || formula.includes('-') || 
          formula.includes('*') || formula.includes('/')) {
        return this.calculateBasicFormula(formula, task);
      }

      // Advanced formulas
      if (formula.toUpperCase().includes('SUM')) {
        return this.calculateSum(formula, task);
      }

      if (formula.toUpperCase().includes('AVG')) {
        return this.calculateAverage(formula, task);
      }

      if (formula.toUpperCase().includes('IF')) {
        return this.calculateIf(formula, task);
      }

      return 0;
    } catch (error) {
      console.error('Formula calculation error:', error);
      return 'Error';
    }
  }

  /**
   * Calculate basic arithmetic formula
   */
  private static calculateBasicFormula(formula: string, task: WorkspaceTask): number {
    // Replace field references with actual values
    let expression = formula;
    
    expression = expression.replace(/budget/gi, String(task.budget || 0));
    expression = expression.replace(/budgetRemaining/gi, String(task.budgetRemaining || 0));
    expression = expression.replace(/spent/gi, String(task.budget - task.budgetRemaining || 0));
    
    // Safely evaluate the expression
    try {
      // Use Function constructor for safer evaluation than eval
      const result = new Function('return ' + expression)();
      return typeof result === 'number' ? result : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate SUM formula
   */
  private static calculateSum(formula: string, task: WorkspaceTask): number {
    const values = this.extractValues(formula, task);
    return values.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Calculate AVG formula
   */
  private static calculateAverage(formula: string, task: WorkspaceTask): number {
    const values = this.extractValues(formula, task);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate IF formula
   */
  private static calculateIf(formula: string, task: WorkspaceTask): number | string {
    // Simple IF implementation
    // Format: IF(condition, trueValue, falseValue)
    const match = formula.match(/IF\s*\((.*?),\s*(.*?),\s*(.*?)\)/i);
    if (!match) return 'Invalid IF';

    const [, condition, trueValue, falseValue] = match;
    
    try {
      const conditionResult = this.evaluateCondition(condition, task);
      return conditionResult ? this.getValue(trueValue, task) : this.getValue(falseValue, task);
    } catch {
      return 'Error';
    }
  }

  /**
   * Extract numeric values from formula
   */
  private static extractValues(formula: string, task: WorkspaceTask): number[] {
    const values: number[] = [];
    
    // Extract field references
    const fieldMatches = formula.match(/\w+/g) || [];
    
    for (const field of fieldMatches) {
      if (field.toUpperCase() === 'SUM' || field.toUpperCase() === 'AVG') continue;
      
      const value = this.getFieldValue(field, task);
      if (typeof value === 'number') {
        values.push(value);
      }
    }
    
    return values;
  }

  /**
   * Get field value from task
   */
  private static getFieldValue(field: string, task: WorkspaceTask): number | string | null {
    const fieldLower = field.toLowerCase();
    
    switch (fieldLower) {
      case 'budget':
        return task.budget || 0;
      case 'budgetremaining':
        return task.budgetRemaining || 0;
      case 'spent':
        return (task.budget || 0) - (task.budgetRemaining || 0);
      case 'comments':
        return task.comments || 0;
      default:
        return null;
    }
  }

  /**
   * Evaluate a condition
   */
  private static evaluateCondition(condition: string, task: WorkspaceTask): boolean {
    // Simple condition evaluation
    // Support: >, <, >=, <=, ==, !=
    const operators = ['>=', '<=', '==', '!=', '>', '<'];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftValue = this.getValue(left, task);
        const rightValue = this.getValue(right, task);
        
        switch (op) {
          case '>': return Number(leftValue) > Number(rightValue);
          case '<': return Number(leftValue) < Number(rightValue);
          case '>=': return Number(leftValue) >= Number(rightValue);
          case '<=': return Number(leftValue) <= Number(rightValue);
          case '==': return leftValue == rightValue;
          case '!=': return leftValue != rightValue;
        }
      }
    }
    
    return false;
  }

  /**
   * Get value (field or literal)
   */
  private static getValue(value: string, task: WorkspaceTask): number | string {
    value = value.trim();
    
    // Check if it's a number
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Check if it's a field reference
    const fieldValue = this.getFieldValue(value, task);
    if (fieldValue !== null) {
      return fieldValue;
    }
    
    // Return as string (might be quoted)
    return value.replace(/['"]/g, '');
  }

  /**
   * Validate formula syntax
   */
  static validateFormula(formula: string): { valid: boolean; error?: string } {
    if (!formula || formula.trim() === '') {
      return { valid: false, error: 'Formula is empty' };
    }

    // Check for balanced parentheses
    let openCount = 0;
    for (const char of formula) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
      if (openCount < 0) {
        return { valid: false, error: 'Unbalanced parentheses' };
      }
    }
    
    if (openCount !== 0) {
      return { valid: false, error: 'Unbalanced parentheses' };
    }

    return { valid: true };
  }
}

/**
 * Format calculated value for display
 */
export const formatCalculatedValue = (value: number | string, type: 'number' | 'currency' = 'number'): string => {
  if (typeof value === 'string') return value;
  
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
