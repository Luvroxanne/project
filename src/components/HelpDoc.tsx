import React from 'react';
import './HelpDoc.css';

const HelpDoc: React.FC = () => {
    return (
        <div className="help-doc-container">
            <div className="help-header">
                <h1>Excel导入帮助文档</h1>
            </div>
            <div className="help-content">
                <section className="help-section">
                    <h2>1. 文件要求</h2>
                    <ul>
                        <li>支持的文件格式：.xls、.xlsx</li>
                        <li>文件大小限制：5MB以内</li>
                        <li>数据量限制：
                            <ul>
                                <li>普通导入：最多50000行、500列</li>
                                <li>含部门成员字段：最多10000行、500列</li>
                            </ul>
                        </li>
                        <li>单元格要求：不支持合并单元格</li>
                    </ul>
                </section>

                <section className="help-section">
                    <h2>2. 导入步骤说明</h2>
                    <div className="step-guide">
                        <h3>第一步：选择Excel文件</h3>
                        <ul>
                            <li>点击上传区域或将文件拖拽到上传区域</li>
                            <li>系统会自动校验文件格式和大小</li>
                        </ul>

                        <h3>第二步：预览数据</h3>
                        <ul>
                            <li>选择要导入的工作表</li>
                            <li>点击任意行可将其设置为标题行</li>
                            <li>标题行之前的数据将不会被导入</li>
                            <li>标题行将作为表单字段的默认标题</li>
                        </ul>

                        <h3>第三步：配置表单</h3>
                        <ul>
                            <li>设置表单名称和分组</li>
                            <li>可以修改字段标题</li>
                            <li>为每个字段选择适当的字段类型：
                                <ul>
                                    <li>数字：用于数值数据</li>
                                    <li>文本：用于文字、代码等</li>
                                    <li>日期：用于日期时间数据</li>
                                </ul>
                            </li>
                        </ul>

                        <h3>第四步：导入数据</h3>
                        <ul>
                            <li>系统会自动校验数据格式</li>
                            <li>显示导入进度和结果</li>
                            <li>完成后可以在表单列表中查看导入的表单</li>
                        </ul>
                    </div>
                </section>

                <section className="help-section">
                    <h2>3. 常见问题</h2>
                    <div className="faq">
                        <h3>Q: 为什么无法上传文件？</h3>
                        <p>A: 请检查：</p>
                        <ul>
                            <li>文件格式是否为.xls或.xlsx</li>
                            <li>文件大小是否超过5MB</li>
                            <li>是否存在合并单元格</li>
                        </ul>

                        <h3>Q: 如何选择正确的字段类型？</h3>
                        <p>A: 根据数据内容选择：</p>
                        <ul>
                            <li>纯数字数据选择"数字"类型</li>
                            <li>文字内容选择"文本"类型</li>
                            <li>日期数据选择"日期"类型</li>
                        </ul>

                        <h3>Q: 导入数据时出现错误怎么办？</h3>
                        <p>A: 常见解决方案：</p>
                        <ul>
                            <li>检查数据格式是否与选择的字段类型匹配</li>
                            <li>确保必填字段不为空</li>
                            <li>检查数据是否超出限制范围</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HelpDoc; 