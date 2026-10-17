import {
  ArrowCircleDown,
  DoNotDisturb,
  NearMe,
  StopCircleOutlined,
  SwapHoriz,
  SyncOutlined,
  SystemUpdateAlt
} from "@mui/icons-material";
import { JSXElementConstructor, ReactElement } from "react";
import { Expr } from "./schema/DocumentTypes";
import { Dimension, DimensionName, Dimensions } from "./ExpressionStore";
import KeepInLane from "../assets/KeepInLane";

export type ConstraintPropertyType = Expr | boolean;

export type ConstraintPropertyDefinition<P extends ConstraintPropertyType> = {
  name: string;
  description: string;
  defaultVal: P;
} & (P extends Expr ? { dimension: Dimension<DimensionName> } : object);

export type DataPropsList = { [key: string]: ConstraintPropertyType };
export type PropertyDefinitionList<P extends DataPropsList> = {
  [key in keyof P]: ConstraintPropertyDefinition<P[key]>;
};
export type ConstraintDefinition<
  K extends ConstraintKey,
  D extends ConstraintData = DataMap[K]
> = {
  type: D["type"];
  name: string;
  shortName: string;
  icon: ReactElement<any, string | JSXElementConstructor<any>>;
  description: string;
  wptScope: boolean;
  sgmtScope: boolean;
  properties: PropertyDefinitionList<D["props"]>;
};

// Constraints
interface IConstraintData<name, Props extends DataPropsList> {
  readonly type: name;
  props: Props;
}

export type ConstraintDataTypeMap = {
  // Record<string,never> broke the keyof operator
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  StopPoint: {};
  MaxVelocity: { max: Expr };
  MaxAcceleration: { max: Expr };
  MaxAngularVelocity: { max: Expr };
  MaxAngularAcceleration: { max: Expr };
  PointAt: {
    x: Expr;
    y: Expr;
    tolerance: Expr;
    flip: boolean;
  };
  KeepInCircle: {
    x: Expr;
    y: Expr;
    r: Expr;
  };
  KeepInRectangle: {
    x: Expr;
    y: Expr;
    w: Expr;
    h: Expr;
  };
  KeepInLane: {
    tolerance: Expr;
  };
  KeepInBounds: {
    tolerance: Expr;
  };
  KeepOutCircle: {
    x: Expr;
    y: Expr;
    r: Expr;
  };
  Strafe: { tolerance: Expr; maxAngVel: Expr };
  // Record<string,never> broke the keyof operator
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  StrafeDiff: {};
  FrontPivot: { d: Expr };
};
export type DataMap = {
  [K in keyof ConstraintDataTypeMap]: IConstraintData<
    K,
    ConstraintDataTypeMap[K]
  >;
};
export type ConstraintData = DataMap[keyof DataMap];

type defs = { [K in ConstraintKey]: ConstraintDefinition<K> };
export const ConstraintDefinitions: defs = {
  StopPoint: {
    type: "StopPoint" as const,
    name: "Stop Point",
    shortName: "Stop",
    description: "Zero linear and angular velocity at waypoint",
    icon: <StopCircleOutlined />,
    properties: {},
    wptScope: true,
    sgmtScope: false
  } satisfies ConstraintDefinition<"StopPoint">,
  MaxVelocity: {
    type: "MaxVelocity" as const,
    name: "Max Velocity",
    shortName: "Max Velo",
    description: "Maximum Velocity",
    icon: Dimensions.LinVel.icon(),
    properties: {
      max: {
        name: "Max Velocity",
        description: "Maximum linear velocity of robot chassis",
        dimension: Dimensions.LinVel,
        defaultVal: { exp: "0 m/s", val: 0 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"MaxVelocity">,
  MaxAcceleration: {
    type: "MaxAcceleration" as const,
    name: "Max Acceleration",
    shortName: "Max Acc",
    description: "Maximum Linear Acceleration",
    icon: Dimensions.LinAcc.icon(),
    properties: {
      max: {
        name: "Max Acceleration",
        description: "Maximum Linear Acceleration of robot chassis",
        dimension: Dimensions.LinAcc,
        defaultVal: { exp: "10 m/s^2", val: 0 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"MaxAcceleration">,
  MaxAngularVelocity: {
    type: "MaxAngularVelocity" as const,
    name: "Max Angular Velocity",
    shortName: "Max Ang Vel",
    description: "Maximum Angular Velocity",
    icon: <SyncOutlined />,
    properties: {
      max: {
        name: "Max Angular Velocity",
        description: "Maximum Angular Velocity of robot chassis",
        dimension: Dimensions.AngVel,
        defaultVal: { exp: "0 rad/s", val: 0 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"MaxAngularVelocity">,
  MaxAngularAcceleration: {
    type: "MaxAngularAcceleration" as const,
    name: "Max Angular Acceleration",
    shortName: "Max Ang Acc",
    description: "Maximum Angular Acceleration",
    icon: <SyncOutlined />,
    properties: {
      max: {
        name: "Max Angular Acceleration",
        description: "Maximum angular acceleration of robot chassis",
        dimension: Dimensions.AngAcc,
        defaultVal: { exp: "0 rad / s^2", val: 0 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"MaxAngularAcceleration">,
  PointAt: {
    type: "PointAt" as const,
    name: "Point At",
    shortName: "Point At",
    description: "Face a specified point",
    icon: <NearMe />,
    properties: {
      x: {
        name: "X",
        description: "The x coordinate of the point the robot should face",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      y: {
        name: "Y",
        description: "The y coordinate of the point the robot should face",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      tolerance: {
        name: "θ Tol.",
        description:
          "The allowable heading range relative to the direction to the point. Keep less than Pi.",
        dimension: Dimensions.Angle,
        defaultVal: { exp: "1 deg", val: Math.PI / 180.0 }
      },
      flip: {
        name: "Flip",
        description:
          "Whether to point the back of the robot at the point instead of the front",
        defaultVal: false
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"PointAt">,
  KeepInCircle: {
    type: "KeepInCircle" as const,
    name: "Keep In Circle",
    shortName: "Keep In Circle",
    description: "Keep the robot's bumpers within a circular region",
    icon: <ArrowCircleDown />,
    properties: {
      x: {
        name: "X",
        description: "The x coordinate of the center of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      y: {
        name: "Y",
        description: "The y coordinate of the center of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      r: {
        name: "R",
        description: "The radius of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "1 m", val: 1 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"KeepInCircle">,
  KeepInRectangle: {
    type: "KeepInRectangle" as const,
    name: "Keep In Rectangle",
    shortName: "Keep In Rect",
    description: "Keep the robot's bumpers within a rectangular region",
    icon: <SystemUpdateAlt />,
    properties: {
      x: {
        name: "X",
        description:
          "The x coordinate of the bottom left of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      y: {
        name: "Y",
        description:
          "The y coordinate of the bottom left of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      w: {
        name: "W",
        description: "The width of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "1 m", val: 1 }
      },
      h: {
        name: "H",
        description: "The height of the keep-in region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "1 m", val: 1 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"KeepInRectangle">,
  KeepInLane: {
    type: "KeepInLane" as const,
    name: "Keep In Lane",
    shortName: "Keep In Lane",
    description: "Keep the robot's center within a lane",
    icon: <KeepInLane />,
    properties: {
      tolerance: {
        name: "Tolerance",
        description: "Robot center max distance from line between waypoints",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0.01 m", val: 0.01 }
      }
    },
    wptScope: false,
    sgmtScope: true
  } satisfies ConstraintDefinition<"KeepInLane">,
  KeepInBounds: {
    type: "KeepInBounds" as const,
    name: "Keep In Bounds",
    shortName: "Keep In Bounds",
    description:
      "Keep the robot within a lane between each consecutive waypoint pair in the constraint range",
    icon: <KeepInLane />,
    properties: {
      tolerance: {
        name: "Tolerance",
        description: "Maximum allowed distance from the line between each waypoint pair",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0.5 m", val: 0.5 }
      }
    },
    wptScope: false,
    sgmtScope: true
  } satisfies ConstraintDefinition<"KeepInBounds">,
  KeepOutCircle: {
    type: "KeepOutCircle" as const,
    name: "Keep Out Circle",
    shortName: "Keep Out Circle",
    description: "Keep the robot's bumpers outside of a circular region",
    icon: <DoNotDisturb />,
    properties: {
      x: {
        name: "X",
        description: "The x coordinate of the center of the keep-out region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      y: {
        name: "Y",
        description: "The y coordinate of the center of the keep-out region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0 m", val: 0 }
      },
      r: {
        name: "R",
        description: "The radius of the keep-out region",
        dimension: Dimensions.Length,
        defaultVal: { exp: "1 m", val: 1 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"KeepOutCircle">,
  Strafe: {
    type: "Strafe" as const,
    name: "Strafe",
    shortName: "Strafe",
    description:
      "Prevent strafing by limiting the angle between the robot heading and its velocity direction (swerve only)",
    icon: <SwapHoriz />,
    properties: {
      tolerance: {
        name: "Max Angle",
        description:
          "Maximum allowed angle between the robot's heading and its linear velocity direction",
        dimension: Dimensions.Angle,
        defaultVal: { exp: "0 deg", val: 0 }
      },
      maxAngVel: {
        name: "Max Ang Vel",
        description:
          "Maximum angular velocity, used to prevent the robot from twirling to satisfy the heading constraint",
        dimension: Dimensions.AngVel,
        defaultVal: { exp: "3.14 rad/s", val: Math.PI }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"Strafe">,
  StrafeDiff: {
    type: "StrafeDiff" as const,
    name: "Strafe Diff",
    shortName: "Strafe Diff",
    description:
      "Enforce differential-drive kinematics: zero lateral velocity (swerve only)",
    icon: <SwapHoriz />,
    properties: {},
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"StrafeDiff">,
  FrontPivot: {
    type: "FrontPivot" as const,
    name: "Front Pivot",
    shortName: "Front Pivot",
    description:
      "Place the instantaneous center of rotation at a fixed distance in front of the robot, so the front stays stationary while the back swings around (swerve only)",
    icon: <SwapHoriz />,
    properties: {
      d: {
        name: "Pivot Distance",
        description:
          "Distance from robot center to the front pivot point along the heading direction",
        dimension: Dimensions.Length,
        defaultVal: { exp: "0.5 m", val: 0.5 }
      }
    },
    wptScope: true,
    sgmtScope: true
  } satisfies ConstraintDefinition<"FrontPivot">
};

export type ConstraintKey = keyof DataMap;
export const consts = Object.values(ConstraintDefinitions);
