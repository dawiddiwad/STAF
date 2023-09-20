import { exec } from 'child_process';

interface SalesforceCliParameters {
    cmd: string,
    f?: Array<string>,
    log?: boolean
}
export class SalesforceCliHandler {
    private path: string;

    constructor(sfdxEnvPathVariable: string) {
        this.path = sfdxEnvPathVariable;
    }

    private pass(paramsList: Array<string>): string {
        let params: string = '';
        paramsList.forEach((param) => {
            params += `${param} `;
        });
        return params;
    }

    private parseResponse(response: string): Object {
        try {
            const cliColoring = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
            response = response.replace(cliColoring, '');
            return JSON.parse(response);
        }
        catch (error) {
            throw new Error(`unable to parse SFDX command response:\n\n${response}\n\ndue to:\n${error}`);
        }
    }

    private handleError(message: string): string {
        return JSON.stringify(this.parseResponse(message), null, 3);
    }

    public exec({ cmd, f: flags, log }: SalesforceCliParameters): Promise<Object> {
        cmd = `${this.path} ${cmd} ${flags ? this.pass(flags) : null}`;
        if (log) console.info(`executing SFDX command: ${cmd}`);
        return new Promise<Object>((success) => {
            exec(`${cmd}`, (error, stdout) => {
                if (error && error.code === 1) {
                    throw new Error(`SFDX command failed with exit code: ${error.code} caused by:\n${error.message}\nerror details:\n${this.handleError(stdout)}`);
                } else {
                    return success(flags?.includes('--json') ? this.parseResponse(stdout) : stdout);
                }
            });
        });
    }
}