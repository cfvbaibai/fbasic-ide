import { ref } from 'vue'

import { classifyColorWithPalette } from '@/shared/utils/colorClassification'

/**
 * Composable for image analysis and sprite array generation
 */
export function useImageAnalysis() {
  const isAnalyzing = ref(false)
  const hasAnalyzed = ref<boolean>(false)
  const generatedArray = ref<string>('')
  const imageWidth = ref<number>(0)
  const imageHeight = ref<number>(0)
  const cellWidth = ref<number>(0)
  const cellHeight = ref<number>(0)

  const analyzeImage = async (
    imageUrl: string,
    adjustedCellSize: { value: number },
    gridOffsetX: { value: number },
    gridOffsetY: { value: number }
  ): Promise<void> => {
    isAnalyzing.value = true

    try {
      const img = new Image()
      img.src = imageUrl

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
      })

      const gridSize = 16
      const calculatedCellWidth = Math.floor(img.width / gridSize)
      const calculatedCellHeight = Math.floor(img.height / gridSize)

      // Store dimensions for grid overlay
      imageWidth.value = img.width
      imageHeight.value = img.height
      cellWidth.value = calculatedCellWidth
      cellHeight.value = calculatedCellHeight
      // Use average cell size for uniform grid spacing
      adjustedCellSize.value = (calculatedCellWidth + calculatedCellHeight) / 2
      gridOffsetX.value = 0
      gridOffsetY.value = 0

      hasAnalyzed.value = true
    } catch (error) {
      console.error('Error analyzing image:', error)
    } finally {
      isAnalyzing.value = false
    }
  }

  const generateArray = async (
    imageUrl: string,
    imageWidth: number,
    imageHeight: number,
    adjustedCellSize: number,
    gridOffsetX: number,
    gridOffsetY: number,
    errorMessage: string,
    paletteType: 'background' | 'sprite' = 'background',
    paletteCode: number = 1,
    colorCombination: number = 0
  ): Promise<void> => {
    if (!imageUrl || !hasAnalyzed.value) return
    
    try {
      const img = new Image()
      img.src = imageUrl
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
      })
      
      // Create canvas to sample pixels
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Generate 4 separate 8x8 arrays (one for each quadrant of the 16x16 grid)
      const gridSize = 8
      const arrays: number[][][] = [[], [], [], []]
      
      // Generate array for each quadrant
      for (let quadrant = 0; quadrant < 4; quadrant++) {
        const quadrantRow = Math.floor(quadrant / 2) // 0 or 1
        const quadrantCol = quadrant % 2 // 0 or 1
        
        for (let row = 0; row < gridSize; row++) {
          const rowArray: number[] = []
          for (let col = 0; col < gridSize; col++) {
            // Calculate cell position in the 16x16 grid
            const globalRow = quadrantRow * gridSize + row
            const globalCol = quadrantCol * gridSize + col
            
            // Calculate cell boundaries in original image coordinates
            const cellStartX = gridOffsetX + globalCol * adjustedCellSize
            const cellStartY = gridOffsetY + globalRow * adjustedCellSize
            
            // Sample pixels in the cell (sample center and corners)
            const samplePoints = [
              [cellStartX + adjustedCellSize / 2, cellStartY + adjustedCellSize / 2], // center
              [cellStartX + adjustedCellSize * 0.25, cellStartY + adjustedCellSize * 0.25], // top-left
              [cellStartX + adjustedCellSize * 0.75, cellStartY + adjustedCellSize * 0.25], // top-right
              [cellStartX + adjustedCellSize * 0.25, cellStartY + adjustedCellSize * 0.75], // bottom-left
              [cellStartX + adjustedCellSize * 0.75, cellStartY + adjustedCellSize * 0.75], // bottom-right
            ]
            
            const colors: number[] = []
            for (const point of samplePoints) {
              const x = point[0] ?? 0
              const y = point[1] ?? 0
              const pixelX = Math.floor(Math.max(0, Math.min(x, imageWidth - 1)))
              const pixelY = Math.floor(Math.max(0, Math.min(y, imageHeight - 1)))
              const index = (pixelY * imageWidth + pixelX) * 4
              
              if (index + 2 >= imageData.data.length) continue
              
              const r = imageData.data[index] ?? 0
              const g = imageData.data[index + 1] ?? 0
              const b = imageData.data[index + 2] ?? 0
              
              // Use palette-based classification if palette and combination are provided
              const colorIndex = classifyColorWithPalette(r, g, b, paletteType, paletteCode, colorCombination)
              colors.push(colorIndex)
            }
            
            // Use most common color in the cell, default to 0 if no samples
            if (colors.length === 0) {
              rowArray.push(0)
            } else {
              const colorCounts = [0, 0, 0, 0]
              colors.forEach(color => {
                const colorIndex = typeof color === 'number' && color >= 0 && color <= 3 ? color : 0
                if (colorCounts[colorIndex] !== undefined) {
                  colorCounts[colorIndex]++
                }
              })
              const maxCount = Math.max(...colorCounts)
              const dominantColor = colorCounts.indexOf(maxCount)
              rowArray.push(dominantColor >= 0 ? dominantColor : 0)
            }
          }
          const quadrantArray = arrays[quadrant]
          if (quadrantArray) {
            quadrantArray.push(rowArray)
          }
        }
      }
      
      // Format as 4 separate const declarations
      const arrayStrings = arrays.map((array) => {
        if (!array) return ''
        const arrayString = array.map(row => `  [${row?.join(',') ?? ''}]`).join(',\n')
        return arrayString
      }).filter(str => str !== '')
      
      const tileNames = ['_0', '_1', '_2', '_3']
      const formattedArrays = arrayStrings.map((str, index) => 
        `const SPRITE_ARRAY${tileNames[index]} = [\n${str}\n]`
      )
      
      generatedArray.value = formattedArrays.join('\n\n')
    } catch (error) {
      console.error('Error generating array:', error)
      generatedArray.value = errorMessage
    }
  }

  return {
    isAnalyzing,
    hasAnalyzed,
    generatedArray,
    imageWidth,
    imageHeight,
    cellWidth,
    cellHeight,
    analyzeImage,
    generateArray
  }
}
