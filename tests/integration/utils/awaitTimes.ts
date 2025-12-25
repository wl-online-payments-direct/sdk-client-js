/**
 * Awaiting a promise x times
 */
export async function awaitTimes(
    num: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: () => Promise<any>,
) {
    for (let i = 0; i < num; i++) {
        await fn();
    }
}
