import { ReactNode, useState } from "react";
import { PlaygroundDeviceSelector } from "@/components/playground/PlaygroundDeviceSelector";
import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

// 从组件库内部导入正确的 ToggleSource 类型
type ToggleSource = import('@livekit/components-core').ToggleSource;

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

  // 类型安全的转换函数
  const getToggleSource = (source: Track.Source): ToggleSource => {
    const sourceMap: Record<Track.Source, ToggleSource> = {
      [Track.Source.Camera]: 'camera',
      [Track.Source.Microphone]: 'microphone',
      [Track.Source.ScreenShare]: 'screen_share',
      [Track.Source.ScreenShareAudio]: 'screen_share_audio',
      [Track.Source.Unknown]: 'camera' // 默认值
    };
    return sourceMap[source];
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
                source={getToggleSource(source)}
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
