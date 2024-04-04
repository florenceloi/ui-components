/* eslint-disable no-magic-numbers */
import './controls.css'

import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded'
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import React from 'react'

import { formatDurationTime } from '../../helper'

interface MediaIconButtonProps {
  onClick: () => void
  ariaLabel: string
  icon: React.ReactNode
  className?: string
  dataCy?: string
}

export function MediaIconButton(props: MediaIconButtonProps) {
  return (
    <IconButton
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={props.className}
      data-cy={props.dataCy}
    >
      {props.icon}
    </IconButton>
  )
}

interface MediaControls {
  mediaElement: HTMLMediaElement
}

export type BufferRange = {
  start: number
  end: number
}

interface ProgressSliderProps extends MediaControls {
  bufferedRanges: BufferRange[]
  elapsedTimeInSeconds: number
  durationTimeInSeconds: number
}

export function ProgressSlider(props: ProgressSliderProps) {
  const formattedElapsedTime = formatDurationTime(props.elapsedTimeInSeconds)

  function handleTimeChange(event: Event, newValue: number | number[]) {
    props.mediaElement.currentTime = newValue as number
  }

  function renderBufferedProgressBar() {
    return props.bufferedRanges.map((range, index) => (
      <Box
        key={index}
        className="rustic-progress-buffered"
        sx={{
          backgroundColor: 'primary.light',
          // eslint-disable-next-line no-magic-numbers
          width: `${((range.end - range.start) / props.durationTimeInSeconds) * 100}%`,
        }}
      />
    ))
  }

  return (
    <Box className="rustic-progress">
      <Slider
        className="rustic-progress-slider"
        data-cy="progress-slider"
        size="small"
        aria-label="Time"
        aria-valuetext={`Current time: ${formattedElapsedTime}`}
        max={props.durationTimeInSeconds}
        value={props.elapsedTimeInSeconds}
        onChange={handleTimeChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => formatDurationTime(value)}
        sx={{
          '& .MuiSlider-rail': {
            backgroundColor: 'action.disabled',
          },
        }}
      />
      {renderBufferedProgressBar()}
    </Box>
  )
}

interface VolumeSettingsProps extends MediaControls {
  volumeFraction: number
}

export function VolumeSettings(props: VolumeSettingsProps) {
  const label = props.mediaElement.muted ? 'unmute' : 'mute'
  const Icon =
    props.volumeFraction === 0 ? VolumeOffRoundedIcon : VolumeUpRoundedIcon

  function handleMuteToggle() {
    if (props.mediaElement.muted && props.mediaElement.volume === 0) {
      // If audio was muted and volume was 0, unmute and restore to full volume
      props.mediaElement.muted = false
      props.mediaElement.volume = 1
    } else if (props.mediaElement.muted) {
      // If audio was muted, unmute and restore previous volume
      props.mediaElement.muted = false
    } else {
      // If audio was unmuted, mute
      props.mediaElement.muted = true
    }
  }

  function handleVolumeChange(
    event: Event | React.MouseEvent,
    newValue: number | number[]
  ) {
    if (newValue === 0) {
      props.mediaElement.muted = true
    } else {
      props.mediaElement.muted = false
    }

    props.mediaElement.volume = newValue as number
  }

  return (
    <Box className="rustic-volume-settings">
      <MediaIconButton
        onClick={handleMuteToggle}
        className="rustic-mute-button"
        dataCy="mute-button"
        ariaLabel={label}
        icon={<Icon color="primary" />}
      />
      <Slider
        className="rustic-volume-slider"
        data-cy="volume-slider"
        size="small"
        max={1}
        step={0.1}
        aria-label="Volume"
        // eslint-disable-next-line no-magic-numbers
        aria-valuetext={`Volume: ${props.volumeFraction * 100}%`}
        value={props.volumeFraction}
        onChange={handleVolumeChange}
        sx={{
          '& .MuiSlider-rail': {
            backgroundColor: 'action.disabled',
          },
          '& .MuiSlider-track': {
            backgroundColor: 'primary.light',
            borderColor: 'primary.light',
          },
        }}
      />
    </Box>
  )
}

interface TranscriptToggleProps {
  isTranscriptShown: boolean
  setIsTranscriptShown: () => void
}

export function TranscriptToggle(props: TranscriptToggleProps) {
  const Icon = props.isTranscriptShown
    ? KeyboardArrowUpIcon
    : KeyboardArrowDownIcon

  const buttonText = `${props.isTranscriptShown ? 'Hide' : 'Show'} Transcript`

  return (
    <Button
      className="rustic-transcript-toggle"
      data-cy="transcript-toggle"
      size="small"
      onClick={props.setIsTranscriptShown}
      endIcon={<Icon />}
    >
      <Typography variant="overline">{buttonText}</Typography>
    </Button>
  )
}

interface PausePlayToggleProps extends MediaControls {
  isPlaying: boolean
}

export function PausePlayToggle(props: PausePlayToggleProps) {
  const label = props.isPlaying ? 'pause' : 'play'
  const Icon = props.isPlaying ? PauseCircleFilledIcon : PlayCircleFilledIcon

  function handlePausePlayToggle() {
    if (props.mediaElement.paused || props.mediaElement.ended) {
      props.mediaElement.play()
    } else {
      props.mediaElement.pause()
    }
  }

  return (
    <MediaIconButton
      onClick={handlePausePlayToggle}
      ariaLabel={label}
      dataCy={`${label}-button`}
      icon={<Icon fontSize="medium" color="primary" />}
      className="rustic-pause-play-icon"
    />
  )
}

interface PlaybackRateButtonProps extends MediaControls {
  playbackRate: number
}

export function PlaybackRateButton(props: PlaybackRateButtonProps) {
  function handlePlaybackRateChange() {
    let newPlaybackRate
    // Increase playback speed by 0.5 until until 2 is reached, then reset to 1
    if (props.mediaElement.playbackRate === 2) {
      newPlaybackRate = 1
    } else {
      newPlaybackRate = props.mediaElement.playbackRate + 0.5
    }

    props.mediaElement.playbackRate = newPlaybackRate
  }

  return (
    <Button
      onClick={handlePlaybackRateChange}
      className="rustic-playback-rate-button"
      aria-label={`Playback rate: ${props.playbackRate}x, click to change`}
      data-cy="playback-rate-button"
    >
      <Typography variant="body1" color="primary.main">
        {props.playbackRate}X
      </Typography>
    </Button>
  )
}

interface MoveTenSecondsButtonProps extends MediaControls {
  movement: 'replay' | 'forward'
  isMobile: boolean
}

export function MoveTenSecondsButton(props: MoveTenSecondsButtonProps) {
  const isReplayMovement = props.movement === 'replay'

  const onClick = isReplayMovement
    ? handleReplayTenSeconds
    : handleForwardTenSeconds

  const label = isReplayMovement ? 'replay' : 'forward'
  const Icon = isReplayMovement ? Replay10RoundedIcon : Forward10RoundedIcon
  const fontSize = props.isMobile ? 'large' : 'medium'

  function handleForwardTenSeconds() {
    props.mediaElement.currentTime += 10
  }

  function handleReplayTenSeconds() {
    props.mediaElement.currentTime -= 10
  }

  return (
    <MediaIconButton
      onClick={onClick}
      ariaLabel={`${label} ten seconds`}
      dataCy={`${label}-button`}
      icon={<Icon color="primary" fontSize={fontSize} />}
    />
  )
}
