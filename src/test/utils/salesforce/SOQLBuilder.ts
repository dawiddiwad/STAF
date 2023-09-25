import { SalesforceUserDefinition } from "../common/SalesforceUsers";

export class SOQLBuilder {
    private parseValue(value: unknown){
        if(typeof value == 'boolean'){
            return `${value}`
        } else {
            return `'${value}'`
        }
    }

    crmUsersMatching(config: SalesforceUserDefinition): string{
        const soql: string[] = [] 
        soql.push(`SELECT Id, Username FROM USER`)
        soql.push(`WHERE IsActive = true`)
        soql.push(`AND UserType = 'Standard'`)
        if (config.details){
            Object.entries(config.details)
                .forEach(record => 
                    soql.push(`AND ${record[0]} = ${this.parseValue(record[1])}`))
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
}