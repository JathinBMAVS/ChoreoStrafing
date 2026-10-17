// Copyright (c) TrajoptLib contributors

#pragma once

#include <cmath>

#include <sleipnir/autodiff/variable.hpp>
#include <sleipnir/optimization/problem.hpp>

#include "trajopt/geometry/pose2.hpp"
#include "trajopt/geometry/translation2.hpp"
#include "trajopt/util/symbol_exports.hpp"

namespace trajopt {

/// Linear velocity heading constraint with tolerance.
///
/// Constrains the angle between the robot's heading and its linear velocity
/// direction to be at most `tolerance` radians. The heading (a decision
/// variable) is forced to follow the path, not the other way around.
///
/// Uses a squared dot product so that both forward and backward motion are
/// permitted — only purely lateral motion is penalized.
class TRAJOPT_DLLEXPORT LinearVelocityHeadingConstraint {
 public:
  /// Constructs a LinearVelocityHeadingConstraint.
  ///
  /// @param tolerance Maximum allowed angle between heading and velocity
  ///     direction (radians). Must be nonnegative.
  explicit LinearVelocityHeadingConstraint(double tolerance)
      : m_cos_tol{std::cos(tolerance)} {}

  /// Applies this constraint to the given problem.
  ///
  /// @param problem The optimization problem.
  /// @param pose The robot's pose.
  /// @param linear_velocity The robot's linear velocity.
  /// @param angular_velocity The robot's angular velocity.
  /// @param linear_acceleration The robot's linear acceleration.
  /// @param angular_acceleration The robot's angular acceleration.
  void apply(
      slp::Problem<double>& problem, const Pose2v<double>& pose,
      const Translation2v<double>& linear_velocity,
      [[maybe_unused]] const slp::Variable<double>& angular_velocity,
      [[maybe_unused]] const Translation2v<double>& linear_acceleration,
      [[maybe_unused]] const slp::Variable<double>& angular_acceleration) {
    // heading_unit = <cos(heading), sin(heading)> — decision variables
    // dot = heading_unit · v
    //
    // Constraint: dot >= cos(tolerance) * ‖v‖
    //
    // This forces the robot's heading (a decision variable) to stay within
    // `tolerance` of its velocity direction, forward-facing only.
    // Using slp::hypot (same pattern as PointAtConstraint) avoids the squared
    // form that would permit the optimizer to satisfy the constraint by
    // flipping the heading 180° to face backward.
    auto dot = pose.rotation().cos() * linear_velocity.x() +
               pose.rotation().sin() * linear_velocity.y();
    problem.subject_to(
        dot >= m_cos_tol *
                   slp::hypot(linear_velocity.x(), linear_velocity.y()));
  }

 private:
  double m_cos_tol;
};

}  // namespace trajopt
