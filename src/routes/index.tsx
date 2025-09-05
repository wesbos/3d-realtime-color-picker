import { createFileRoute } from '@tanstack/react-router'
import { ColorPickerApp } from '../components/ColorPickerApp'

export const Route = createFileRoute('/')({
  component: ColorPickerApp,
})

