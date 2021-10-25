import React, { useState, useEffect, CSSProperties } from 'react';
import { Activity, useLanyard } from 'use-lanyard';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';

// @ts-ignore
import Twemoji from 'react-twemoji';
import ContentLoader from 'react-content-loader';

import styled from 'styled-components';

export enum DiscordBackgroundStyle {
  DARK = 'rgb(22, 22, 22)',
  LIGHT = '#fff'
}

export enum DiscordTextStyle {
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}

interface DiscordAssetOverrides {
  [key: string]: string;
}

interface DiscordProps {
  id: string;
  bgStyle?: DiscordBackgroundStyle | string;
  textStyle?: DiscordTextStyle;
  border?: boolean;
  largeAssetOverrides?: DiscordAssetOverrides;
  blacklistedActivities?: string[];
  style?: CSSProperties;
}

const DEFAULT_LARGE_ASSET_OVERRIDES = {
  VALORANT: 'https://cdn.discordapp.com/app-icons/700136079562375258/e55fc8259df1548328f977d302779ab7'
}

const TRANSPARENT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function Discord({id, bgStyle = DiscordBackgroundStyle.DARK, textStyle = DiscordTextStyle.LIGHT, border = true, largeAssetOverrides = DEFAULT_LARGE_ASSET_OVERRIDES, blacklistedActivities = [], style = {}}: DiscordProps) {
  const { data: activity } = useLanyard(id);

  largeAssetOverrides = { ...DEFAULT_LARGE_ASSET_OVERRIDES, ...largeAssetOverrides };

  const [spotifyDuration, setSpotifyDuration] = useState('0:00 / 0:00');
  const [spotifyProgress, setSpotifyProgress] = useState(0);

  const [intervalCheck, setIntervalCheck] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activity !== undefined && activity.spotify && Date.now() <= activity.spotify.timestamps.end) {
        const current = Math.floor((Date.now() - activity.spotify.timestamps.start) / 1000);
        const currentFormatted = `${Math.floor(current / 60)}:${Math.floor(current % 60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
    
        const endTime = Math.floor((activity.spotify.timestamps.end - activity.spotify.timestamps.start) / 1000);
        const endFormatted = `${Math.floor(endTime / 60)}:${Math.floor(endTime % 60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
    
        setSpotifyDuration(`${currentFormatted} / ${endFormatted}`);

        setSpotifyProgress(((Date.now() - activity.spotify.timestamps.start) / (activity.spotify.timestamps.end - activity.spotify.timestamps.start)) * 100);
      }
      setIntervalCheck(intervalCheck + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [intervalCheck, activity]);

  function getFormattedTimestamp(start: number) {
    if ( start === 0 ) return '';
    const current = Math.floor((Date.now() - start) / 1000);
    return `${Math.floor(current / 60) >= 60 ? `${(Math.floor(Math.floor(current / 60) / 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}:` : ``}${(Math.floor(Math.floor(current / 60) - (Math.floor(Math.floor(current / 60) / 60)*60))).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}:${Math.floor(current % 60).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })} elapsed`;
  }

  function getDiscordAssetURL(application: number | undefined, asset: string | undefined) {
    return `https://cdn.discordapp.com/app-assets/${application}/${asset}.png`;
  }

  function getLargeAssetOverride(name : string) {
    return largeAssetOverrides[name] ? largeAssetOverrides[name] : undefined;
  }

  function DiscordEmoji({id, animated}: any) {
    return <img className='emoji' alt='emoji' width={20} src={`https://cdn.discordapp.com/emojis/${id}${animated ? '.gif' : '.png'}`} />
  }

  function DiscordUserInfoStatus() {
    if (activity) {
      if (activity.active_on_discord_desktop) {
        return (
          <>
            <StatusCircle status={activity.discord_status === 'dnd' || activity.discord_status === 'idle' ? activity.discord_status : activity.active_on_discord_desktop ? 'online' : 'offline'} bg={bgStyle} />
          </>
        )
      } else if (activity.active_on_discord_mobile) {
        return (
          <>
            <MobileStatus status={activity.discord_status === 'dnd' || activity.discord_status === 'idle' ? activity.discord_status : activity.active_on_discord_mobile ? 'online' : 'offline'} bg={bgStyle}><FontAwesomeIcon icon={faMobileAlt} /></MobileStatus>
          </>
        )
      } else {
        return (
          <>
            <StatusCircle status={'offline'} bg={bgStyle} />
          </>
        )
      }
    }
    return <> </>;
  }

  function DiscordUserInfo() {
    if (activity) {
      return (
        <>
          <Row style={{paddingBottom: '8px'}}>
            <ImageContainer>
              <AvatarImage
                src={ `https://cdn.discordapp.com/avatars/${activity.discord_user.id}/${activity.discord_user.avatar}${activity.discord_user.avatar.startsWith('a_') ? '.gif' : '.png' }` }
                alt={ `${activity.discord_user.id}#${activity.discord_user.discriminator}` }
                width={60}
                height={60}
              />
              <DiscordUserInfoStatus />
            </ImageContainer>
          </Row>
          <Row style={ activity.activities.length > 0 ? {paddingBottom: '16px'} : {}}>
            <Info style={{padding: 0, margin: 0}}><h3>{ activity.discord_user.username }<span style={textStyle === DiscordTextStyle.LIGHT ? {color: '#b9bbbe'} : {color: '#4f5660'}}>#{ activity.discord_user.discriminator }</span></h3></Info>
          </Row>
        </>
      )
    }
    return <></>;
  }

  function DiscordUserActivity(activityData: Activity, index: number) {
    if (activity) {
      switch(activityData.type) {
        case 0: {
          return (
            <div key={index}>
              <Row>
                <ActivityHeader text={textStyle}>PLAYING A GAME</ActivityHeader>
              </Row>
              <Row style={ index < (activity.activities.length - 1) ? {paddingBottom: '16px'} : {} }>
                <ImageContainer>
                  <PrimaryImage
                    src={ activityData.assets && activityData.assets.large_image !== undefined ? getDiscordAssetURL(activityData.application_id, activityData.assets.large_image) : getLargeAssetOverride(activityData.name) ? getLargeAssetOverride(activityData.name) : TRANSPARENT_IMAGE }
                    alt={ activityData.assets && activityData.assets.large_text !== undefined ? activityData.assets.large_text : '' }
                    width={60}
                    height={60}
                  />
                  <SecondaryImage
                    src={ activityData.assets && activityData.assets.small_image !== undefined ? getDiscordAssetURL(activityData.application_id, activityData.assets.small_image) : TRANSPARENT_IMAGE }
                    alt={ activityData.assets && activityData.assets.small_text !== undefined ? activityData.assets.small_text : '' }
                    width={20}
                    height={20}
                  />
                </ImageContainer>
                <InfoContainer>
                  <Info><h5>{activityData.name}</h5></Info>
                  <Info>{activityData.details && <p>{activityData.details}</p>}</Info>
                  <Info>{activityData.state && <p>{activityData.state}</p>}</Info>
                  <Info><p>{getFormattedTimestamp(activityData?.timestamps?.start ? activityData.timestamps.start : 0)}</p></Info>
                </InfoContainer>
              </Row>
            </div>
          )
        }
        case 2: {
          if (activity.spotify) {
            return (
              <div key={index}>
                <Row>
                  <ActivityHeader text={textStyle}>LISTENING TO SPOTIFY</ActivityHeader>
                </Row>
                <Row>
                  <ImageContainer>
                    <PrimaryImage
                      alt={ activity.spotify.song }
                      src={ activity.listening_to_spotify ? activity.spotify.album_art_url : '' }
                      width={60}
                      height={60}
                    />
                  </ImageContainer>
                  <InfoContainer>
                    <Info>{activity.spotify.song && <h5>{activity.spotify.song}</h5>}</Info>
                    <Info>{activity.spotify.artist && <p>by {activity.spotify.artist.replaceAll(';', ',')}</p>}</Info>
                    <Info>{activity.spotify.album && <p>on {activity.spotify.album}</p>}</Info>
                    <Info></Info>
                  </InfoContainer>
                </Row>
                <Row style={ index < (activity.activities.length - 1) ? {paddingBottom: '16px'} : {} }>
                  <ProgressContainer>
                    <ProgressBackground text={textStyle}>
                      <ProgressForeground style={{width: `${spotifyProgress}%`}} text={textStyle} />
                    </ProgressBackground>
                    <TimestampContainer>
                      <p>{spotifyDuration.split(' / ')[0]}</p>
                      <p>{spotifyDuration.split(' / ')[1]}</p>
                    </TimestampContainer>
                  </ProgressContainer>
                </Row>
              </div>
            )
          } else return <></>
        }
        case 4: {
          if ( activityData.emoji && activityData.emoji.id ) {
            return (
              <div key={index}>
                <Row>
                  <ActivityHeader style={{fontWeight: 400, display: 'flex', alignItems: 'center', paddingBottom: '10px'}} text={textStyle}><DiscordEmoji id={activityData.emoji.id} animated={activityData.emoji.animated} />{activityData.state}</ActivityHeader>
                </Row>
              </div>
            )
          } else {
            return (
              <div key={index}>
                <Row>
                  <ActivityHeader style={{fontWeight: 400}}><Twemoji style={{display: 'flex', alignItems: 'center', paddingBottom: '10px'}} text={textStyle}>{activityData.emoji ? activityData.emoji.name : ''}{activityData.state}</Twemoji></ActivityHeader>
                </Row>
              </div>
            )
          }
        }
      }
    } else return <></>;
  }

	function DiscordLoader(props: any) {
		return (
			<ContentLoader 
				speed={2}
				width={300}
				height={110}
				viewBox="0 0 525 175"
				{...props}
				style={{padding: 0, margin: 0}}
			>
				<circle cx="55" cy="55" r="55" /> 
				<rect x="0" y="125" rx="3" ry="3" width="250" height="50" />
			</ContentLoader>
		)
	}

  if (activity) {
    return (
      <>
        <DiscordContainer bg={bgStyle} text={textStyle} border={border} style={style}>
          <DiscordUserInfo />
          { activity.activities.map((x, index) => DiscordUserActivity(x, index)) }
        </DiscordContainer>
      </>
    )
  } else {
    return (
			<>
				<DiscordContainer bg={bgStyle} text={textStyle} border={border} style={style}>
					{textStyle === DiscordTextStyle.LIGHT ? (
						<DiscordLoader
							backgroundColor="#2b2b2b"
							foregroundColor="#424242"
						/>
					) : (
						<DiscordLoader
							backgroundColor="#c9c9c9"
							foregroundColor="#ffffff"
						/>
					)}
        </DiscordContainer>
			</>
		)
  }
}

interface StatusStyleProps {
  status?: 'online' | 'dnd' | 'idle' | 'offline';
  bg?: string;
  text?: DiscordTextStyle;
  border?: boolean;
}

const DiscordContainer = styled.div<StatusStyleProps>`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');
  font-family: 'Inter', sans-serif;

  color: ${props => props.text === DiscordTextStyle.LIGHT ? '#DCDDDE' : '#000'};
  background-color: ${props => props.bg};
  ${props => props.border ? 'border: 0.75px solid rgba(200, 200, 200, 0.3);' : ''}
  ${props => props.border ? 'border-radius: 5px;' : ''}

  padding: 16px;
  width: 266px;
  min-height: 95px;

  transition: background-color 1s;
  transition: border-color 1s;

  &:hover {
    cursor: default;
    backdrop-filter: brightness(125%);
  }

  .emoji {
    width: 20px;
    margin-right: 8px;
  }
`

const PrimaryImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 5px;
`;

const SecondaryImage = styled.img`
  width: 20px;
  height: 20px;
  position: absolute;
  bottom: -5px;
  right: -5px;
  border-radius: 50%;
`;

const AvatarImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;

const ActivityHeader = styled.h6<StatusStyleProps>`
  margin-bottom: 8px;
  margin-top: 0;
  font-size: 12px;
  color: ${props => props.text === DiscordTextStyle.LIGHT ? '#b9bbbe' : '#4f5660' };
`;

const ImageContainer = styled.div`
  position: relative;
  height: 60px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Info = styled.div`
  margin-left: 1rem;
  text-align: left;
  h5 {
    margin: 0;
    font-size: 13px;
    
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  h3 {
    margin: 0;
    font-size: 20px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  p {
    margin: 0;
    padding-top: 3px;
    font-size: 10px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  margin-top: 10px;
  margin-left: 0rem;
  text-align: left;
  h5 {
    margin: 0;
    font-size: 13px;
    
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  p {
    margin: 0;
    padding-top: 3px;
    font-size: 10px;

    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const ProgressBackground = styled.div<StatusStyleProps>`
  background-color: ${props => props.text === DiscordTextStyle.LIGHT ? 'rgba(200, 200, 200, 0.3)' : 'rgba(79, 84, 92, .16)'};
  height: 5px;
  border-radius: 5px;
`;

const ProgressForeground = styled.div<StatusStyleProps>`
  background-color: ${props => props.text === DiscordTextStyle.LIGHT ? '#dcddde' : '#060607'};
  height: 5px;
  border-radius: 5px;
`;

const TimestampContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StatusCircle = styled.div<StatusStyleProps>`
  position: absolute;
  bottom: -2px;
  right: -2px;
  display: inline-block;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
  background-color: ${props => {
    switch(props.status) {
      case 'online': {
        return 'rgb(28, 176, 80)';
      }
      case 'dnd': {
        return '#f04747';
      }
      case 'idle': {
        return '#faa81a';
      }
      case 'offline': {
        return '#747f8d';
      }
    }
  }};
  border: 3px solid ${props => props.bg};
`;

const MobileStatus = styled.div<StatusStyleProps>`
  position: absolute;
  bottom: -2px;
  right: -2px;
  border-radius: 3px;
  text-align: center;
  padding-top: 3px;
  font-size: 16px;
  width: 17px;
  height: 20px;
  display: inline-block;
  color: ${props => {
    switch(props.status) {
      case 'online': {
        return 'rgb(28, 176, 80)';
      }
      case 'dnd': {
        return '#f04747';
      }
      case 'idle': {
        return '#faa81a';
      }
      case 'offline': {
        return '#747f8d';
      }
    }
  }};
  background-color: ${props => props.bg};
`;