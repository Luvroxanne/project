import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Select, Checkbox, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { read, utils } from 'xlsx';
import './ExcelForm.css';
import dayjs from 'dayjs';

interface ExcelData {
    headers: string[];
    rows: any[][];
    selectedColumns: boolean[];
}

interface SheetData {
    [key: string]: ExcelData;
}

interface ExcelFormProps {
    isZoomed: boolean;
    onZoomChange: (zoomed: boolean) => void;
    onClose: () => void;
}

interface FormData {
    formInfo: {
        formName: string;
        formGroup: string;
        createTime: string;
        updateTime: string;
    };
    fields: {
        title: string;
        key: string;
        type: string;
        rules: {
            required: boolean;
            message: string;
        }[];
    }[];
    data: {
        headers: string[];
        rows: any[][];
    };
    metadata: {
        totalRows: number;
        selectedColumns: boolean[];
        titleRowIndex: number;
        importTime: string;
    };
}

const ExcelForm: React.FC<ExcelFormProps> = ({ isZoomed, onZoomChange, onClose }) => {
    const [activeSteps, setActiveSteps] = useState<number[]>([1]); // 使用数组存储激活的步骤
    const [isDragging, setIsDragging] = useState(false);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [sheets, setSheets] = useState<string[]>([]);
    const [excelData, setExcelData] = useState<SheetData>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [titleRowIndex, setTitleRowIndex] = useState<{ [key: string]: number }>({});
    const [formName, setFormName] = useState('新建 Microsoft Excel ...');
    const [formGroup, setFormGroup] = useState('--无分组--');
    const [importCount, setImportCount] = useState(0);
    const [fieldTypes, setFieldTypes] = useState<{ [key: string]: string }>({});

    const handleZoomToggle = () => {
        onZoomChange(!isZoomed);
    };

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        return () => {
            document.body.style.zoom = "100%";
        };
    }, []);

    const validateFile = (file: File): boolean => {
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('文件大小不能超过 5MB');
            return false;
        }

        const validTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (!validTypes.includes(fileExtension)) {
            message.error('只支持 .xlsx、.xls 和 .csv 格式的文件');
            return false;
        }

        return true;
    };

    const readExcelFile = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = e.target?.result;
                    if (!data) {
                        message.error('文件读取失败');
                        resolve(false);
                        return;
                    }

                    let workbook;
                    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
                    
                    if (fileExtension === '.csv') {
                        // 处理 CSV 文件
                        let csvData = data.toString();
                        
                        // 检测是否包含乱码（通常是 GBK 编码导致）
                        if (/�/.test(csvData)) {
                            // 如果检测到乱码，重新以 GBK 编码读取文件
                            const gbkReader = new FileReader();
                            const gbkData = await new Promise<string>((gbkResolve) => {
                                gbkReader.onload = (gbkEvent) => {
                                    const decoder = new TextDecoder('gbk');
                                    const arrayBuffer = gbkEvent.target?.result as ArrayBuffer;
                                    gbkResolve(decoder.decode(arrayBuffer));
                                };
                                gbkReader.readAsArrayBuffer(file);
                            });
                            csvData = gbkData;
                        }
                        
                        const rows = csvData.split('\n')
                            .map(row => row.trim().split(',').map(cell => cell.trim()))
                            .filter(row => row.length > 0 && row.some(cell => cell !== ''));
                        
                        const worksheet = utils.aoa_to_sheet(rows);
                        workbook = {
                            SheetNames: ['Sheet1'],
                            Sheets: {
                                'Sheet1': worksheet
                            }
                        };
                    } else {
                        // 处理 Excel 文件
                        workbook = read(data, { type: 'binary' });
                    }

                    const sheetNames = workbook.SheetNames;
                    const sheetsData: SheetData = {};
                    
                    sheetNames.forEach((sheetName: string) => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
                        
                        if (jsonData.length > 0) {
                            const headers = jsonData[0] as string[];
                            const rows = jsonData.slice(1) as any[][];
                            
                            sheetsData[sheetName] = {
                                headers,
                                rows,
                                selectedColumns: new Array(headers.length).fill(true)
                            };
                        }
                    });

                    setSheets(sheetNames);
                    setSelectedSheet(sheetNames[0]);
                    setExcelData(sheetsData);
                    
                    const defaultTitleRows: { [key: string]: number } = {};
                    sheetNames.forEach(sheetName => {
                        defaultTitleRows[sheetName] = 0;
                    });
                    setTitleRowIndex(defaultTitleRows);
                    
                    const currentSheet = sheetsData[sheetNames[0]];
                    if (currentSheet) {
                        const rowCount = currentSheet.rows.length;
                        const colCount = currentSheet.headers.length;
                        
                        if (rowCount > 50000 || colCount > 500) {
                            message.error('文件数据超过限制（50000行、500列）');
                            resolve(false);
                            return;
                        }
                    }
                    
                    resolve(true);
                } catch (error) {
                    console.error('File parsing error:', error);
                    message.error('文件解析失败，请检查文件格式是否正确');
                    resolve(false);
                }
            };
            
            reader.onerror = () => {
                message.error('文件读取失败');
                resolve(false);
            };
            
            if (file.name.toLowerCase().endsWith('.csv')) {
                reader.readAsText(file, 'utf-8');  // 首先尝试 UTF-8
            } else {
                reader.readAsBinaryString(file);
            }
        });
    };

    const handleFileSelect = async (selectedFile: File) => {
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
            setIsUploading(true);
            
            let progress = 0;
            const interval = setInterval(async () => {
                progress += 5;
                setUploadProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    const success = await readExcelFile(selectedFile);
                    if (success) {
                        setIsUploading(false);
                        setActiveSteps([1, 2]); // 同时激活步骤1和2
                        message.success('文件上传成功');
                    } else {
                        setIsUploading(false);
                        setFile(null);
                    }
                }
            }, 100);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleSheetChange = (value: string) => {
        setSelectedSheet(value);
    };

    const handleRowClick = (rowIndex: number) => {
        setTitleRowIndex({
            ...titleRowIndex,
            [selectedSheet]: rowIndex
        });
    };

    const handleNextStep = () => {
        if (activeSteps.includes(2)) {
            // 从第二步进入第三步时，准备表单字段数据
            if (selectedSheet) {
                const selectedData = excelData[selectedSheet];
                // 如果没有选择标题行，则使用所有数据
                const dataRowCount = titleRowIndex[selectedSheet] !== undefined
                    ? selectedData.rows.length - (titleRowIndex[selectedSheet] + 1)
                    : selectedData.rows.length;
                setImportCount(dataRowCount);
            }
            setActiveSteps([1, 2, 3]);
        }
    };

    const handleHelpLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open('/help-doc', '_blank', 'noopener,noreferrer');
    };

    const handleColumnSelect = (columnIndex: number) => {
        if (selectedSheet && excelData[selectedSheet]) {
            const newExcelData = { ...excelData };
            newExcelData[selectedSheet] = {
                ...newExcelData[selectedSheet],
                selectedColumns: newExcelData[selectedSheet].selectedColumns.map(
                    (selected, index) => index === columnIndex ? !selected : selected
                )
            };
            setExcelData(newExcelData);
        }
    };

    const handleSelectAllColumns = (checked: boolean) => {
        if (selectedSheet && excelData[selectedSheet]) {
            const newExcelData = { ...excelData };
            newExcelData[selectedSheet] = {
                ...newExcelData[selectedSheet],
                selectedColumns: new Array(newExcelData[selectedSheet].headers.length).fill(checked)
            };
            setExcelData(newExcelData);
        }
    };

    const handleSaveForm = async () => {
        if (!selectedSheet || !excelData[selectedSheet]) {
            message.error('请先导入数据');
            return;
        }

        const selectedData = excelData[selectedSheet];
        const currentTime = dayjs().toISOString();

        // 构建要保存的数据结构
        const formData: FormData = {
            formInfo: {
                formName,
                formGroup,
                createTime: currentTime,
                updateTime: currentTime
            },
            fields: selectedData.headers
                .filter((_, index) => selectedData.selectedColumns[index])
                .map((header, index) => ({
                    title: header,
                    key: `field_${index}`,
                    type: fieldTypes[`field_${index}`] || 'text',
                    rules: [{
                        required: true,
                        message: `${header}不能为空`
                    }]
                })),
            data: {
                headers: selectedData.headers.filter((_, index) => selectedData.selectedColumns[index]),
                rows: selectedData.rows
                    .slice(titleRowIndex[selectedSheet] + 1)
                    .map(row => row.filter((_, index) => selectedData.selectedColumns[index]))
            },
            metadata: {
                totalRows: selectedData.rows.length - (titleRowIndex[selectedSheet] + 1),
                selectedColumns: selectedData.selectedColumns,
                titleRowIndex: titleRowIndex[selectedSheet],
                importTime: currentTime
            }
        };

        try {
            // 保存到本地存储，实际项目中应该调用API
            const existingForms = JSON.parse(localStorage.getItem('forms') || '[]');
            const newForm = {
                id: Date.now().toString(),
                ...formData
            };
            existingForms.push(newForm);
            localStorage.setItem('forms', JSON.stringify(existingForms));
            
            message.success('表单保存成功');
            onClose(); // 关闭弹窗
            window.location.href = '/manage'; // 跳转到数据管理页面
        } catch (error) {
            message.error('保存失败，请重试');
            console.error('Save form error:', error);
        }
    };

    const handleFieldTypeChange = (fieldKey: string, type: string) => {
        setFieldTypes(prev => ({
            ...prev,
            [fieldKey]: type
        }));
    };

    const renderColumnSelector = () => {
        if (!selectedSheet || !excelData[selectedSheet]) return null;

        const handleMenuItemClick = (e: React.MouseEvent) => {
            // 阻止事件冒泡，防止点击复选框时关闭菜单
            e.stopPropagation();
        };

        const items = [
            {
                key: 'all',
                label: (
                    <div onClick={handleMenuItemClick}>
                        <Checkbox
                            checked={excelData[selectedSheet].selectedColumns.every(Boolean)}
                            indeterminate={
                                excelData[selectedSheet].selectedColumns.some(Boolean) &&
                                !excelData[selectedSheet].selectedColumns.every(Boolean)
                            }
                            onChange={(e) => handleSelectAllColumns(e.target.checked)}
                        >
                            全选
                        </Checkbox>
                    </div>
                ),
            },
            { key: 'divider', type: 'divider' as const },
            ...excelData[selectedSheet].headers.map((header, index) => ({
                key: index.toString(),
                label: (
                    <div onClick={handleMenuItemClick}>
                        <Checkbox
                            checked={excelData[selectedSheet].selectedColumns[index]}
                            onChange={() => handleColumnSelect(index)}
                        >
                            {header}
                        </Checkbox>
                    </div>
                ),
            })),
        ];

        return (
            <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomLeft"
            >
                <Button className="column-select-button">
                    选择导入的列 <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    const renderStepOne = () => (
        <div className="upload-section">
            <div className="info-box">
                <ul>
                    <li>不能存在合并的单元格</li>
                    <li>支持 5MB 以内的 xls、xlsx、csv 格式文件</li>
                    <li>文件中数据不能超过50000行、500列(若导入存在部门成员字段，则不能超过10000行、500列)</li>
                    <li>更多导入说明和示例，请查看<a href="#" onClick={handleHelpLinkClick}>帮助文档</a></li>
                </ul>
            </div>
            
            {isUploading ? (
                <div className="upload-area uploading">
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-bar-inner" 
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="upload-status">正在上传...</p>
                    </div>
                </div>
            ) : (
                <div
                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                    />
                    <div className="upload-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48">
                            <path fill="#00b96b" d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                        </svg>
                    </div>
                    <p className="upload-text">将文件拖拽到此区域，或 <span className="click-text">点击添加</span></p>
                    <p className="file-limit">文件大小不得超过 5 MB</p>
                </div>
            )}
        </div>
    );

    const renderStepTwo = () => (
        <div className="preview-section">
            <div className="sheet-selector-container">
                <div className="sheet-selector">
                    <label>工作表</label>
                    <Select
                        value={selectedSheet}
                        onChange={handleSheetChange}
                        style={{ width: 200 }}
                    >
                        {sheets.map(sheet => (
                            <Select.Option key={sheet} value={sheet}>{sheet}</Select.Option>
                        ))}
                    </Select>
                    <span className="preview-hint">
                        点击任意行可将其设置为标题行，标题行之前的数据不导入。
                    </span>
                </div>
                <div className="column-selector">
                    {renderColumnSelector()}
                </div>
            </div>

            <div className="data-table">
                {selectedSheet && excelData[selectedSheet] && (
                    <table>
                        <thead>
                            <tr>
                                <th className="title-column">标题行</th>
                                {excelData[selectedSheet].headers.map((header, index) => (
                                    <th key={index} className={!excelData[selectedSheet].selectedColumns[index] ? 'column-disabled' : ''}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {excelData[selectedSheet].rows.map((row, rowIndex) => {
                                const isCurrentTitleRow = titleRowIndex[selectedSheet] === rowIndex;
                                const isBeforeTitleRow = titleRowIndex[selectedSheet] !== undefined && 
                                    rowIndex < titleRowIndex[selectedSheet];
                                
                                return (
                                    <tr 
                                        key={rowIndex} 
                                        className={`
                                            ${isCurrentTitleRow ? 'title-row' : ''}
                                            ${isBeforeTitleRow ? 'before-title-row' : ''}
                                        `}
                                        onClick={() => handleRowClick(rowIndex)}
                                    >
                                        <td className="row-number">
                                            {isCurrentTitleRow ? '标题行' : rowIndex + 1}
                                        </td>
                                        {row.map((cell, cellIndex) => (
                                            <td 
                                                key={cellIndex} 
                                                className={!excelData[selectedSheet].selectedColumns[cellIndex] ? 'column-disabled' : ''}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="form-footer">
                <button className="help-link" onClick={handleHelpLinkClick}>
                    导入说明和示例
                </button>
                <div className="button-group">
                    <button 
                        className="btn-previous" 
                        onClick={() => setActiveSteps([1])}
                    >
                        上一步
                    </button>
                    <button 
                        className="btn-next" 
                        onClick={() => setActiveSteps([1, 2, 3])}
                    >
                        下一步
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStepThree = () => {
        // 只获取选中的列的标题
        const headerTitles = selectedSheet 
            ? excelData[selectedSheet].headers.filter((_, index) => 
                excelData[selectedSheet].selectedColumns[index]
              )
            : [];
        
        // 获取数据行，只包含选中的列
        const dataRows = selectedSheet 
            ? (titleRowIndex[selectedSheet] !== undefined 
                ? [
                    excelData[selectedSheet].rows[titleRowIndex[selectedSheet]].filter((_, index) => 
                        excelData[selectedSheet].selectedColumns[index]
                    ),
                    ...excelData[selectedSheet].rows
                        .slice(titleRowIndex[selectedSheet] + 1)
                        .map(row => row.filter((_, index) => 
                            excelData[selectedSheet].selectedColumns[index]
                        ))
                ]
                : excelData[selectedSheet].rows.map(row => 
                    row.filter((_, index) => excelData[selectedSheet].selectedColumns[index])
                  ))
            : [];

        const handleTitleChange = (index: number, newValue: string) => {
            if (selectedSheet) {
                const newExcelData = { ...excelData };
                newExcelData[selectedSheet] = {
                    ...newExcelData[selectedSheet],
                    headers: newExcelData[selectedSheet].headers.map((header, i) => 
                        i === index ? newValue : header
                    )
                };
                setExcelData(newExcelData);
            }
        };

        return (
            <div className="form-config-section">
                <div className="form-header">
                    <div className="form-field">
                        <label>表单名称</label>
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-field">
                        <label>表单分组</label>
                        <Select
                            value={formGroup}
                            onChange={(value) => setFormGroup(value)}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="--无分组--">--无分组--</Select.Option>
                        </Select>
                    </div>
                    <div className="import-status">
                        <div className="success-icon-circle">
                            <span className="success-icon">✓</span>
                        </div>
                        导入 {dataRows.length} 列 / 共 {dataRows.length} 列
                    </div>
                </div>

                <div className="form-fields-table">
                    <table>
                        <thead>
                            <tr>
                                <th>字段标题</th>
                                {headerTitles.map((title, index) => (
                                    <th key={index}>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => handleTitleChange(index, e.target.value)}
                                            className="field-input"
                                        />
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th>字段类型</th>
                                {headerTitles.map((_, index) => (
                                    <th key={index}>
                                        <Select
                                            value={fieldTypes[`field_${index}`] || 'text'}
                                            onChange={(value) => handleFieldTypeChange(`field_${index}`, value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'text', label: '单行文本' },
                                                { value: 'number', label: '数字' },
                                                { value: 'textarea', label: '多行文本' },
                                                { value: 'date', label: '日期时间' },
                                                { value: 'radio', label: '单选按钮组' },
                                                { value: 'checkbox', label: '复选按钮组' },
                                                { value: 'select', label: '下拉框' },
                                                { value: 'switch', label: '是否' },
                                                { value: 'upload', label: '附件' },
                                                { value: 'image', label: '图片' },
                                                { value: 'address', label: '地址' },
                                                { value: 'location', label: '位置' }
                                            ]}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataRows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{rowIndex + 1}</td>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="form-footer">
                    <button className="help-link" onClick={handleHelpLinkClick}>
                        导入说明和示例
                    </button>
                    <div className="button-group">
                        <button 
                            className="btn-previous" 
                            onClick={() => setActiveSteps([1, 2])}
                        >
                            上一步
                        </button>
                        <button 
                            className="btn-next" 
                            onClick={handleSaveForm}
                        >
                            保存
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderCurrentStep = () => {
        if (!activeSteps.includes(2)) {
            return renderStepOne();
        }
        if (!activeSteps.includes(3)) {
            return renderStepTwo();
        }
        return renderStepThree();
    };

    return (
        <div className={`excel-form-container ${isZoomed ? 'fullscreen' : ''}`}>
            <div className="header">
                <h1>新建表单</h1>
                <div>
                    <button className="zoom-button" onClick={handleZoomToggle}>
                        {isZoomed ? "⤢" : "⤢"}
                    </button>
                    <button className="close-button" onClick={handleClose}>×</button>
                </div>
            </div>
            <hr className="divider" />
            <div className="step-indicator">
                <div className={`step ${activeSteps.includes(1) ? 'completed' : ''}`}>
                    <span>{activeSteps.includes(2) ? '✓' : '1'}</span>
                    <p>选择Excel</p>
                </div>
                <hr className={`step-divider ${activeSteps.includes(2) ? 'completed' : ''}`} />
                <div className={`step ${activeSteps.includes(2) ? 'active' : ''}`}>
                    <span>{activeSteps.includes(3) ? '✓' : '2'}</span>
                    <p>预览数据</p>
                </div>
                <hr className={`step-divider ${activeSteps.includes(3) ? 'completed' : ''}`} />
                <div className={`step ${activeSteps.includes(3) ? 'active' : ''}`}>
                    <span>{activeSteps.includes(4) ? '✓' : '3'}</span>
                    <p>配置表单</p>
                </div>
                <hr className="step-divider" />
                <div className="step">
                    <span>4</span>
                    <p>导入数据</p>
                </div>
            </div>
            
            {renderCurrentStep()}
        </div>
    );
};

export default ExcelForm; 