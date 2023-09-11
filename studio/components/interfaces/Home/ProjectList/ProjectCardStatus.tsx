import { RESOURCE_WARNING_MESSAGES } from 'components/ui/ResourceExhaustionWarningBanner/ResourceExhaustionWarningBanner.constants'
import { ResourceWarning } from 'data/usage/resource-warnings-query'
import {
  Alert_Shadcn_,
  AlertDescription_Shadcn_,
  AlertTitle_Shadcn_,
  IconAlertTriangle,
  IconLoader,
  IconPauseCircle,
} from 'ui'

export interface ProjectCardWarningsProps {
  resourceWarnings: ResourceWarning
  projectStatus: string
}

export const ProjectCardStatus = ({
  resourceWarnings,
  projectStatus,
}: ProjectCardWarningsProps) => {
  //const showResourceExhaustionWarnings = useFlag('resourceExhaustionWarnings')
  const showResourceExhaustionWarnings = false

  // [Joshen] Read only takes higher precedence over multiple resource warnings
  const activeWarnings = resourceWarnings.is_readonly_mode_enabled
    ? ['is_readonly_mode_enabled']
    : Object.keys(resourceWarnings).filter(
        (property) =>
          property !== 'project' &&
          property !== 'is_readonly_mode_enabled' &&
          resourceWarnings[property as keyof typeof resourceWarnings] !== null
      )

  const getContent = (metric: string) => {
    if (metric === 'is_readonly_mode_enabled') {
      return RESOURCE_WARNING_MESSAGES.is_readonly_mode_enabled.cardContent.warning
    }

    const severity = resourceWarnings[metric as keyof typeof resourceWarnings]

    if (typeof severity !== 'string') return undefined

    return RESOURCE_WARNING_MESSAGES[metric as keyof typeof RESOURCE_WARNING_MESSAGES][
      'cardContent'
    ][severity as 'warning' | 'critical']
  }

  const hasCriticalWarning = activeWarnings.some(
    (x) => resourceWarnings[x as keyof typeof resourceWarnings] === 'critical'
  )

  const isCritical = activeWarnings.includes('is_readonly_mode_enabled') || hasCriticalWarning

  const getWarningType = () => {
    let type = 'default'

    switch (true) {
      case projectStatus === 'isPaused':
        type = 'default'
        break
      case isCritical:
        type = 'destructive'
        break
      default:
        type = 'warning'
        break
    }

    return type as 'warning' | 'destructive' | 'default'
  }

  const AlertIcon = () => {
    switch (true) {
      case projectStatus === 'isPaused' || projectStatus === 'isPausing':
        return <IconPauseCircle strokeWidth={2} />
      case projectStatus === 'isRestoring' || projectStatus === 'isComingUp':
        return <IconLoader size={14} strokeWidth={2} />
      default:
        return <IconAlertTriangle strokeWidth={2} />
    }
  }
  const getTitle = () => {
    if (projectStatus === 'isPaused') return 'Project is paused'
    if (projectStatus === 'isPausing') return 'Project is pausing'
    if (projectStatus === 'isComingUp') return 'Project is coming up'
    if (projectStatus === 'isRestoring') return 'Project is restoring'

    // If none of the paused/restoring states match, proceed with the default logic
    return activeWarnings.length > 1
      ? RESOURCE_WARNING_MESSAGES.multiple_resource_warnings.cardContent[
          hasCriticalWarning ? 'critical' : 'warning'
        ].title
      : getContent(activeWarnings[0])?.title
  }

  const getDescription = () => {
    if (projectStatus === 'isPaused')
      return 'This project will not accept any requests until unpaused.'
    if (projectStatus === 'isPausing')
      return 'This project is entering a paused state. This may take a few minutes.'
    if (projectStatus === 'isComingUp')
      return 'This project is coming up. This may take a few minutes.'
    if (projectStatus === 'isRestoring')
      return 'This project is restoring. This may take a few minutes.'

    // If none of the paused/restoring states match, proceed with the default logic
    return activeWarnings.length > 1 && showResourceExhaustionWarnings
      ? RESOURCE_WARNING_MESSAGES.multiple_resource_warnings.cardContent[
          hasCriticalWarning ? 'critical' : 'warning'
        ].description
      : getContent(activeWarnings[0])?.description
  }

  const alertTitle = getTitle()
  const alertDescription = getDescription()
  const alertType = getWarningType()

  if (activeWarnings.length === 0 && projectStatus === 'isHealthy') return <div className="py-2" />

  return (
    <div>
      <Alert_Shadcn_
        variant={alertType}
        className="border-0 rounded-none rounded-b-md my-2 mb-2.5 [&>svg]:w-[28px]
[&>svg]:h-[28px] [&>svg]:p-1.5 [&>svg]:left-6 pl-6"
      >
        <AlertIcon />

        <AlertTitle_Shadcn_ className="text-xs mb-0.5">{alertTitle}</AlertTitle_Shadcn_>
        <AlertDescription_Shadcn_ className="text-xs">{alertDescription}</AlertDescription_Shadcn_>
      </Alert_Shadcn_>
    </div>
  )
}