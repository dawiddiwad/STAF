import { exec } from 'child_process'

interface SalesforceCliParameters {
    cmd: string,
    f?: Array<string>,
    log?: boolean
}
export class SalesforceCliHandler {
    private path: string

    constructor(path: string = 'sf') {
        this.path = path
    }

    private pass(params: string[]): string {
        return params.join(' ')
    }

    private parseResponse(response: string): Object {
        try {
            const cliColoring = /[\u001b\u009b][[()#?]*(?:[0-9]{1,4}(?:[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
            response = response.replace(cliColoring, '')
            return JSON.parse(response)
        }
        catch (error) {
            throw new Error(`unable to parse SFDX command response:\n\n${response}\n\ndue to:\n${error}`)
        }
    }

    private handleError(message: string): string {
        return JSON.stringify(this.parseResponse(message), null, 3)
    }

    public async exec({ cmd, f: flags, log }: SalesforceCliParameters): Promise<any> {
        const fullCommand = `${this.path} ${cmd} ${flags ? this.pass(flags) : ''}`
        if (log) console.info(`Executing SFDX command: ${fullCommand}`)
        return new Promise<any>((resolve, reject) => {
            exec(fullCommand, (error, stdout) => {
                if (error && error.code === 1) {
                    reject(new Error(`SFDX command failed with exit code: ${error.code} caused by:\n${error.message}\nError details:\n${JSON.stringify(this.parseResponse(stdout), null, 3)}`))
                } else {
                    resolve(flags?.includes('--json') ? this.parseResponse(stdout) : stdout)
                }
            })
        })
    }
}