const JsonData = (info: Record<string, any>) => {
    return <>
        <pre>
            <code>
                {JSON.stringify(info, null, 2)}
            </code>
        </pre>
    </>;
}
 
export default JsonData;