// Copyright (c) TrajoptLib contributors

#pragma once

#include <sleipnir/autodiff/variable.hpp>
#include <sleipnir/optimization/problem.hpp>

#include "trajopt/geometry/pose2.hpp"
#include "trajopt/geometry/translation2.hpp"
#include "trajopt/util/symbol_exports.hpp"

namespace trajopt {

/// Front pivot constraint — a point at distance d in front of the robot center
/// experiences zero lateral (side-to-side) velocity.
///
/// This is analogous to StrafeDiff (which enforces zero lateral velocity at the
/// robot center) but offset forward by d meters. As the robot rotates, its
/// center compensates laterally so the front point does not strafe.
///
/// Single velocity constraint:
///   vx*sin(θ) - vy*cos(θ) == ω*d
class TRAJOPT_DLLEXPORT FrontPivotConstraint {
 public:
  /// Constructs a FrontPivotConstraint.
  ///
  /// @param d Distance from the robot center to the pivot point along the
  ///     robot's heading direction. Units: meters.
  explicit FrontPivotConstraint(double d) : m_d{d} {}

  /// Applies this constraint to the given problem.
  ///
  /// @param problem The optimization problem.
  /// @param pose The robot's pose.
  /// @param linear_velocity The robot's linear velocity.
  /// @param angular_velocity The robot's angular velocity.
  /// @param linear_acceleration The robot's linear acceleration.
  /// @param angular_acceleration The robot's angular acceleration.
  void apply(
      slp::Problem<double>& problem,
      const Pose2v<double>& pose,
      const Translation2v<double>& linear_velocity,
      const slp::Variable<double>& angular_velocity,
      [[maybe_unused]] const Translation2v<double>& linear_acceleration,
      [[maybe_unused]] const slp::Variable<double>& angular_acceleration) {
    // Lateral velocity of the front point = (vx*sinθ - vy*cosθ) - ω*d == 0
    auto lateral = linear_velocity.x() * pose.rotation().sin() -
                   linear_velocity.y() * pose.rotation().cos();
    problem.subject_to(lateral == angular_velocity * m_d);
  }

 private:
  double m_d;
};

}  // namespace trajopt
