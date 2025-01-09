export interface SdkResponse<Data = unknown> {
    status: Response['status'];
    success: Response['ok'];
    data: Data;
}
