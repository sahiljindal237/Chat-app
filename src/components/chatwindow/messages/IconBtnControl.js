import React from 'react';
import { Badge, Icon, IconButton, Tooltip, Whisper } from 'rsuite';

const ConditionalBadge = ({ condition, children }) => {
  return condition ? <Badge content={condition}>{children}</Badge> : children;
};
const IconBtnControl = ({
  isVisible,
  iconName,
  tooltip,
  badgeContent,
  onClick,
  ...props
}) => {
  return (
    <div
      className="ml-2"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <ConditionalBadge condition={badgeContent}>
        <Whisper
          delay={0}
          delayHide={0}
          delayShow={0}
          placement="top"
          trigger="hover"
          speaker={<Tooltip>{tooltip}</Tooltip>}
        >
          <IconButton
            {...props}
            onClick={onClick}
            size="xs"
            circle
            icon={<Icon icon={iconName} />}
          />
        </Whisper>
      </ConditionalBadge>
    </div>
  );
};

export default IconBtnControl;
