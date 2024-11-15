import cliProgress from 'cli-progress'

export const processBar = new cliProgress.SingleBar(
  {
    clearOnComplete: true,
  },
  cliProgress.Presets.legacy,
)
