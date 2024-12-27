import React, { useEffect, useRef } from 'react';
import {MarkdownRenderer} from "./MarkdownRenderer";
import {useChatContext} from '../context/ChatContext';
import { Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

export const StreamedContent: React.FC = () => {
    const {streamedContent, scrollToBottom, isTopToBottom, isStreaming} = useChatContext();
 
    const LoadingIndicator = () => (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            color: 'var(--loading-color, #1890ff)'
        }}>
            <Space>
                <RobotOutlined 
                    style={{ 
                        fontSize: '24px',
                        animation: 'pulse 2s infinite'
                    }} 
                />
                <span style={{ 
                    animation: 'fadeInOut 2s infinite',
                    display: 'inline-block',
                    fontSize: '16px',
                    marginLeft: '8px',
                    verticalAlign: 'middle'
                }}>
                    Processing response...
                </span>
            </Space>
        </div>
    );

    useEffect(() => {
        if (streamedContent) {
            // Focus the input after content updates
            const textarea = document.querySelector('.input-textarea') as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
            }
        }

    }, [streamedContent]);

    const enableCodeApply = window.enableCodeApply === 'true';
    return (
        <>
           {(isStreaming || streamedContent) && (

                <div className="message assistant streamed-message">
                    <div className="message-sender" style={{ marginTop: 0 }}>AI:</div>
		    {isStreaming && !streamedContent ? (
                        <LoadingIndicator />
                    ) : (
                        <MarkdownRenderer
                            markdown={streamedContent}
                            enableCodeApply={enableCodeApply}/>
                    )}
                </div>
            )}
        </>
    );
};
