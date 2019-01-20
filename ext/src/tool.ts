import { post } from 'request';

export function Download<T>(url: string, code: string, format: string): Promise<T> {
    return new Promise((resolve, reject) => {
        post({ url: url, form: { code: code, format: format } },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject({
                        reason: 'Unable to download page',
                    });
                }
            });
    });
}