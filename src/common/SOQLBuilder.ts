import { SalesforceUserDefinition } from "common/SalesforceUsers";

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

    crmUsersMatching(config: SalesforceUserDefinition): string{
        const soql: string[] = []
        soql.push(`SELECT Id, Username FROM USER`)
        soql.push(`WHERE IsActive = true`)
        soql.push(`AND UserType = 'Standard'`)
        if (config.details){
            Object.entries(config.details)
                .forEach(record => {
                    const field = record[0]
                    const value = record[1]
                    if (this.isWildcard(value)){
                        soql.push(`AND ${field} LIKE '${value}'`)
                    } else {
                        soql.push(`AND ${field} = ${this.parse(value)}`)
                    }
                })       
        }
        if (config.permissionSets){
            config.permissionSets
                .forEach(name => {
                    soql.push(`AND Id IN`)
                    soql.push(`(`)
                    soql.push(`SELECT AssigneeId`)
                    soql.push(`FROM PermissionSetAssignment`)
                    soql.push(`WHERE IsActive = true`)
                    soql.push(`AND PermissionSet.name = '${name}'`)
                    soql.push(`)`)
                })
        }
        return soql.join('\n')
    }

    recordTypeByName(name: string): string{
        return `SELECT Id FROM RecordType WHERE Name = '${name}'`
    }
}