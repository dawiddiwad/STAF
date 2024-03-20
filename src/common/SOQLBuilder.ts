import { PermissionSetAssignment, SalesforceUserDefinition } from "common/SalesforceUsers";

export class SOQLBuilder {
    private parse(value: unknown){
        if (typeof value == 'boolean'){
            return `${value}`
        } else {
            return `'${value}'`
        }
    }

    private isWildcard(value: unknown){
        return typeof value == 'string' 
            && (value.startsWith('%') || value.startsWith('_') || value.endsWith('%') || value.endsWith('_'))
    }

    private validateProperty<T>(name: keyof T) {
        return name;
    }

    crmUsersMatching(config: SalesforceUserDefinition): string{

        const soql: string[] = []
        const assigneeId = `${this.validateProperty<PermissionSetAssignment>('Assignee')}.${this.validateProperty<PermissionSetAssignment['Assignee']>('Id')}`
        const assigneeName = `${this.validateProperty<PermissionSetAssignment>('Assignee')}.${this.validateProperty<PermissionSetAssignment['Assignee']>('Name')}`
        const permissionSetName = `${this.validateProperty<PermissionSetAssignment>('PermissionSet')}.${this.validateProperty<PermissionSetAssignment['PermissionSet']>('Name')}`
        soql.push(`SELECT ${assigneeId}, ${assigneeName}, ${permissionSetName}`)
        soql.push(`FROM PermissionSetAssignment`)
        soql.push(`WHERE IsActive = true`)
        soql.push(`AND Assignee.IsActive = true`)
        soql.push(`AND Assignee.UserType = 'Standard'`)
        if (config.details){
            Object.entries(config.details)
                .forEach(record => {
                    const field = record[0]
                    const value = record[1]
                    if (this.isWildcard(value)){
                        soql.push(`AND Assignee.${field} LIKE '${value}'`)
                    } else {
                        soql.push(`AND Assignee.${field} = ${this.parse(value)}`)
                    }
                })       
        }
        soql.push(`ORDER BY Assignee.Name DESC`)
        return soql.join('\n')
    }

    recordTypeByName(name: string): string{
        return `SELECT Id FROM RecordType WHERE Name = '${name}'`
    }
}