import { SyntaxKind } from 'ts-morph';
import type { Expression } from 'ts-morph';

/**
 * Get object property from TypeScript AST expression
 *
 * 从 TypeScript AST 表达式中获取对象属性
 *
 * @param element - The AST expression to get property from
 * @param propertyName - The name of the property to get
 * @returns The property initializer expression or null if not found
 */
export function getObjectProperty(element: Expression, propertyName: string) {
  if (!element.isKind(SyntaxKind.ObjectLiteralExpression)) return null;

  const property = element.getProperty(propertyName);
  if (!property?.isKind(SyntaxKind.PropertyAssignment)) return null;

  const value = property.getInitializer();

  return value || null;
}

/**
 * Get string literal property from TypeScript AST expression
 *
 * 从 TypeScript AST 表达式中获取字符串字面量属性
 *
 * @param element - The AST expression to get string property from
 * @param propertyName - The name of the property to get
 * @returns The string literal expression or null if not found
 */
export function getStringProperty(element: Expression, propertyName: string) {
  const value = getObjectProperty(element, propertyName);
  if (!value?.isKind(SyntaxKind.StringLiteral)) return null;

  return value;
}

/**
 * Update string literal property value in TypeScript AST expression
 *
 * 更新 TypeScript AST 表达式中的字符串字面量属性值
 *
 * @param element - The AST expression to update string property in
 * @param propertyName - The name of the property to update
 * @param newValue - The new string value to set
 */
export function updateStringProperty(element: Expression, propertyName: string, newValue: string) {
  const value = getStringProperty(element, propertyName);
  if (!value) return;

  value.replaceWithText(`'${newValue}'`);
}
