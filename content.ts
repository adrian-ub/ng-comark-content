import { comarkContent } from 'comark-content'
import fs from 'comark-content/sources/fs'
import rangi from '@comark/angular/plugins/rangi'
import { geist } from 'rangi/themes'

export const content = comarkContent({
  source: fs('./content'),
  markdown: {
    plugins: [
      rangi({
        lineNumbers: true,
        theme: geist
      })
    ],
  },
})
