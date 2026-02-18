import styled, { css } from 'styled-components'

export const Shell = styled.main`
  /* max-width: 1420px; */
  margin: 0 auto;
  padding: 28px 18px 96px;
`

export const Hero = styled.section`
  margin-bottom: 18px;
  border-radius: 18px;
  border: 1px solid #1f2b44;
  background:
    radial-gradient(circle at 90% 10%, rgba(69, 201, 255, 0.16), transparent 38%),
    linear-gradient(155deg, #0f1c31, #0b1324);
  padding: 22px;
`

export const StreamCardWrap = styled.div<{ isFocused?: boolean }>`
  display: flex;
  flex-direction: column;

  gap: 8px;

  border: 1px solid #243353;
  background: radial-gradient(circle at top right, rgba(45, 198, 255, 0.07), transparent 42%), #101a2f;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(2, 7, 16, 0.32);

  padding: 8px;

  aspect-ratio: 16 / 9;

  ${({ isFocused }) =>
    isFocused &&
    css`
      position: absolute;
      z-index: 99;
      width: min(96vw, 1300px);
      max-height: 92vh;
      aspect-ratio: 16 / 10;

      margin: auto;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    `}

  .cursor-p {
    cursor: pointer;
  }
`

export const VideoFrame = styled.div<{ $isFocused?: boolean }>`
  position: relative;
  width: 100%;
  flex: 1;

  border-radius: 12px;
  overflow: hidden;
  background: #080f1d;

  ${({ $isFocused }) =>
    $isFocused
      ? css`
          aspect-ratio: 16 / 10;
        `
      : css`
          aspect-ratio: 16 / 9;
        `}

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    object-fit: ${({ $isFocused }) => ($isFocused ? 'contain' : 'cover')};
  }
`

export const FloatingActionWrap = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 220;
`

export const HeaderMeta = styled.div`
  display: grid;
  gap: 4px;
`
