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

    private parseOutputAsJSON(output: string): Object {
        try {
            const cliColoring = /[\u001b\u009b][[()#?]*(?:[0-9]{1,4}(?:[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
            output = output.replace(cliColoring, '')
            return JSON.parse(output)
        }
        catch (error) {
            throw new Error(`unable to parse JSON from ${output}\ndue to:\n${error}`)
        }
    }

    public async exec({ cmd, f: flags, log }: SalesforceCliParameters): Promise<any> {
        const fullCommand = `${this.path} ${cmd} ${flags ? this.pass(flags) : ''}`
        if (log) console.info(`Executing ${this.path} cli command: ${fullCommand}`)
        return new Promise<any>((resolve, reject) => {
            exec(fullCommand, (error, stdout, stderr) => {
                try {
                    if (error && error.code === 1) {
                        throw new Error(`command failed\nError details:${stdout}\ncaused by:\n${error}`)
                    } else if (stderr) {
                        throw new Error(`command failed\nError details:${stderr}`) 
                    } else {
                        if (stdout){
                            resolve(flags?.includes('--json') ? this.parseOutputAsJSON(stdout) : stdout)
                        } else throw new Error(`missing output from ${this.path} cli command`)
                    }
                } catch (error) {
                    reject(`error executing ${this.path} cli command:\n${fullCommand}\ncaused by:\n${error}`)
                }
            })
        })
    }
}