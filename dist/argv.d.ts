declare const _default: {
    rpc: {
        describe: string;
        required: boolean;
    };
    token: {
        describe: string;
        example: string;
        type: string;
    };
    denomination: {
        describe: string;
        default: number;
        type: string;
    };
    start: {
        describe: string;
        default: any;
        type: string;
    };
    end: {
        describe: string;
        default: string;
        type: string;
    };
    balancesJson: {
        describe: string;
        default: any;
        type: string;
    };
};
export default _default;
