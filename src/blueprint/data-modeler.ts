/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Database Schema & SQL DDL Engine
 */

import { DomainEntity, DatabaseTableSchema } from "./types.js";

export class DataModeler {
  private mapSqlType(type: string): string {
    switch (type) {
      case "UUID":
        return "UUID";
      case "STRING":
        return "VARCHAR(255)";
      case "NUMBER":
        return "BIGINT";
      case "BOOLEAN":
        return "BOOLEAN";
      case "DATETIME":
        return "TIMESTAMPTZ";
      case "JSON":
        return "JSONB";
      default:
        return "TEXT";
    }
  }

  /**
   * Generates relational database schemas & DDL statements from domain entities
   */
  public generateSchemas(entities: DomainEntity[]): DatabaseTableSchema[] {
    const schemas: DatabaseTableSchema[] = [];

    for (const entity of entities) {
      const tableName = `${entity.name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}s`;
      const columns = entity.fields.map((f) => ({
        name: f.name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase(),
        sqlType: this.mapSqlType(f.type),
        nullable: !f.required,
        primaryKey: !!f.isPrimary,
        defaultValue: f.name === "createdAt" ? "CURRENT_TIMESTAMP" : undefined,
      }));

      const indexes = entity.fields
        .filter((f) => f.isUnique)
        .map((f) => ({
          name: `idx_${tableName}_${f.name.toLowerCase()}`,
          columns: [f.name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()],
          unique: true,
        }));

      // Build DDL statement
      const colDefs = columns.map((c) => {
        let def = `  ${c.name} ${c.sqlType}`;
        if (c.primaryKey) def += " PRIMARY KEY";
        else if (!c.nullable) def += " NOT NULL";
        if (c.defaultValue) def += ` DEFAULT ${c.defaultValue}`;
        return def;
      });

      const ddl = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${colDefs.join(",\n")}\n);`;

      schemas.push({
        id: `schema-${tableName}`,
        tableName,
        columns,
        indexes,
        ddlCreateStatement: ddl,
        traceRequirementCodes: entity.traceRequirementCodes,
      });
    }

    return schemas;
  }
}
