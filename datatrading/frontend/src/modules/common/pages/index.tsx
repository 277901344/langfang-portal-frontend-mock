import { Result } from 'antd';

function NotFound() {
    return <Result status="404" title="404" subTitle="页面不存在" />;
}

export default NotFound;
