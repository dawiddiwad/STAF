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
        soql.push(`SELECT AssigneeId, Assignee.Username`)
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
        if (config.permissionSets){
            soql.push(`AND PermissionSet.Name IN (${config.permissionSets.map(set => `'${set}'`).join()})`)
        }
        soql.push(`GROUP BY Assignee.Username, AssigneeId`)
        if(config.strictPermissionSets){
            if (config.permissionSets){
                soql.push(`HAVING COUNT(Assignee.Username) = ${config.permissionSets.length}`)
            } else {
                soql.push(`HAVING COUNT(Assignee.Username) = 1`)
            }
        } else if (config.permissionSets){
            soql.push(`HAVING COUNT(Assignee.Username) >= ${config.permissionSets.length}`)
        }
        return soql.join('\n')
    }

    recordTypeByName(name: string): string{
        return `SELECT Id FROM RecordType WHERE Name = '${name}'`
    }
}