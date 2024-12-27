import React, { useState, useRef, useEffect } from 'react';
import {FolderTree} from "./FolderTree";
import {SendChatContainer} from "./SendChatContainer";
import {StreamedContent} from './StreamedContent';
import {Conversation} from "./Conversation";
import {Button, Tooltip, ConfigProvider, theme } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    BulbOutlined,
    SwapOutlined
} from "@ant-design/icons";
import { useTheme } from '../context/ThemeContext';
import { useChatContext } from '../context/ChatContext';

export const App = () => {
    const {streamedContent, messages, startNewChat, isTopToBottom, setIsTopToBottom, scrollToBottom} = useChatContext();
    const enableCodeApply = window.enableCodeApply === 'true';
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const bottomUpContentRef = useRef<HTMLDivElement | null>(null);

    const preserveScrollPosition = (action: () => void) =>    {
      const chatContainer = document.querySelector('.chat-container');
      if (!chatContainer) return;

      if (isTopToBottom) {
        // Get the element and its exact offset from viewport top
        const rect = chatContainer.getBoundingClientRect();
        const messages = chatContainer.querySelectorAll('.message');
        let targetMessage: Element | null = null;
        let targetOffset = 0;

        for (const msg of messages) {
            const msgRect = msg.getBoundingClientRect();
            if (msgRect.top >= rect.top) {
                targetMessage = msg;
                targetOffset = msgRect.top - rect.top;
                break;
            }
        }

        action();

        requestAnimationFrame(() => {
            if (!targetMessage) return;
            const newRect = chatContainer.getBoundingClientRect();
            const newMsgRect = targetMessage.getBoundingClientRect();
            chatContainer.scrollTop += (newMsgRect.top - (newRect.top + targetOffset));
        });

        // Double-check position after transition
        setTimeout(() => {
            const finalMsgRect = targetMessage?.getBoundingClientRect();
            const finalContainerRect = chatContainer.getBoundingClientRect();
            if (finalMsgRect && Math.abs(finalMsgRect.top - (finalContainerRect.top + targetOffset)) > 1) {
               chatContainer.scrollTop += (finalMsgRect.top - (finalContainerRect.top + targetOffset));
            }
        }, 300);
      } else {
        // Bottom-up mode handles itself correctly
        action();
      }
    };

    const togglePanel = () => {
        preserveScrollPosition(() => setIsPanelCollapsed(!isPanelCollapsed));
    };
    
    const toggleDirection = () => {
        setIsTopToBottom(prev => !prev);
    };

    useEffect(() => {
        // Handle scroll position after mode switch
        const chatContainer = document.querySelector('.chat-container');
        const bottomUpContent = document.querySelector('.bottom-up-content');

        setTimeout(() => {
            if (isTopToBottom && chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } else if (!isTopToBottom && bottomUpContent) {
                requestAnimationFrame(() => bottomUpContent.scrollTop = 0);
            }
        }, 100);
    }, [isTopToBottom]);;

    const { isDarkMode, toggleTheme, themeAlgorithm } = useTheme();

    const chatContainerContent = isTopToBottom ? (
        <>
            <Conversation key="conv" enableCodeApply={enableCodeApply}/>
	    <div style={{
		position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <StreamedContent key="stream"/>
                <SendChatContainer/>
            </div>
        </>
    ) : (
            <div className="chat-content-with-fixed-input">
	        <SendChatContainer fixed={true}/>
                <StreamedContent key="stream" />
            <div className="bottom-up-content" ref={bottomUpContentRef}>
                <Conversation key="conv" enableCodeApply={enableCodeApply} />
            </div>
        </div>);

    return (
        <ConfigProvider
            theme={{
                algorithm: themeAlgorithm,
                token: {
                    borderRadius: 6,
                    colorBgContainer: isDarkMode ? '#141414' : '#ffffff',
                    colorText: isDarkMode ? '#ffffff' : '#000000',
                },
            }}
        >
	    <Button
                className={`panel-toggle ${isPanelCollapsed ? 'collapsed' : ''}`}
                type="primary"
                onClick={togglePanel}
                size="small"
                style={{ padding: '4px 8px' }}
            >{isPanelCollapsed ? '›' : '‹'}</Button>
            <div style={{ height: 'var(--app-header-height)' }}>
	    <div className={`app-header ${isPanelCollapsed ? 'panel-collapsed' : ''}`}>
	        <h2 style={{
                    color: isDarkMode ? '#fff' : '#000',
                    transition: 'color 0.3s ease'
                }}>
                <div style={{ position: 'absolute', left: '10px', display: 'flex', gap: '10px' }}>
		<Tooltip title={`Switch to ${isTopToBottom ? 'bottom-up' : 'top-down'} view`}>
                        <Button
                            icon={<SwapOutlined rotate={90} />}
                            onClick={toggleDirection}
                            type={isTopToBottom ? 'primary' : 'default'}
                        >
                            {isTopToBottom ? 'Top-Down' : 'Bottom-Up'}
                        </Button>
                </Tooltip>
                </div>
		                    Ziya: Code Assist
                </h2>
                <div style={{ position: 'absolute', right: '10px', display: 'flex', gap: '10px' }}>
                    <Tooltip title="Toggle theme">
                    <Button icon={<BulbOutlined />} onClick={toggleTheme} />
                    </Tooltip>
                    <Tooltip title="New Chat">
                    <Button icon={<PlusOutlined />} onClick={startNewChat} />
                    </Tooltip>
		</div>
	        </div>
            </div>
            <div className={`container ${isPanelCollapsed ? 'panel-collapsed' : ''}`}>
                <FolderTree isPanelCollapsed={isPanelCollapsed}/>
                <div className="chat-container">
                    {chatContainerContent}
                </div>
            </div>
        </ConfigProvider>
    );
};
