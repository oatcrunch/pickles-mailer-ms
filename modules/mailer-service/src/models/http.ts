export interface IHttpResponse {
    body?: any;
    message?: string;
    instanceId: string;
    // response: IHttpStatus;
}

// export interface IHttpStatus {
//     code: number;
//     message: HttpStatusCodeMessage;
// }

// export enum HttpStatusCodeMessage {
//     HTTP_200 = 'OK',
//     HTTP_201 = 'Created',
//     HTTP_302 = 'Found',
//     HTTP_303 = 'See Other',
//     HTTP_304 = 'Not Modified',
//     HTTP_400 = 'Bad Request',
//     HTTP_401 = 'Unauthorized',
//     HTTP_403 = 'Forbidden',
//     HTTP_404 = 'Not Found',
//     HTTP_500 = 'Internal Server Error'
// }