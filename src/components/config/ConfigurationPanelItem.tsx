import { ReactNode, useState } from "react";
import { PlaygroundDeviceSelector } from "@/components/playground/PlaygroundDeviceSelector";
import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

// 定义 ToggleSource 类型（根据 LiveKit 实际实现）
type ToggleSource = 'camera' | 'microphone' | 'screen_share' | 'screen_share_audio';

type ConfigurationPanelItemProps = {
  title: string;
  children?: ReactNode;
  source?: Track.Source;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export const ConfigurationPanelItem: React.FC<ConfigurationPanelItemProps> = ({
  children,
  title,
  source,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 将 Track.Source 转换为兼容字符串
  const getToggleSource = (source: Track.Source): ToggleSource => {
    switch(source) {
      case Track.Source.Camera: return 'camera';
      case Track.Source.Microphone: return 'microphone';
      case Track.Source.ScreenShare: return 'screen_share';
      case Track.Source.ScreenShareAudio: return 'screen_share_audio';
      default: return 'camera'; // 默认值
    }
  };

  return (
    <div className="w-full text-gray-300 py-4 border-b border-b-gray-800 relative">
      <div className="flex flex-row justify-between items-center px-4 text-xs uppercase tracking-wider">
        <h3>{title}</h3>
        <div className="flex items-center gap-2">
          {source && (
            <span className="flex flex-row gap-2">
              <TrackToggle
                className="px-2 py-1 bg-gray-900 text-gray-300 border border-gray-800 rounded-sm hover:bg-gray-800"
                source={getToggleSource(source)}  // 使用转换后的值
              />
              {source === Track.Source.Camera && (
                <PlaygroundDeviceSelector kind="videoinput" />
              )}
              {source === Track.Source.Microphone && (
                <PlaygroundDeviceSelector kind="audioinput" />
              )}
            </span>
          )}
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${!isCollapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="px-4 py-2 text-xs text-gray-500 leading-normal">
          {children}
        </div>
      )}
    </div>
  );
};
