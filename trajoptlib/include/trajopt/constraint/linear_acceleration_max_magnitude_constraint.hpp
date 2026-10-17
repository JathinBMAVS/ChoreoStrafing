// Copyright (c) TrajoptLib contributors

#pragma once

#include <cassert>

#include <sleipnir/autodiff/variable.hpp>
#include <sleipnir/optimization/problem.hpp>

#include "trajopt/geometry/pose2.hpp"
#include "trajopt/geometry/translation2.hpp"
#include "trajopt/util/symbol_exports.hpp"

namespace trajopt {

/// Linear acceleration max magnitude inequality constraint.
class TRAJOPT_DLLEXPORT LinearAccelerationMaxMagnitudeConstraint {
 public:
  /// Constructs a LinearAccelerationMaxMagnitudeConstraint.
  ///
  /// @param max_magnitude The maximum linear acceleration magnitude. Must be
  ///     nonnegative.
  explicit LinearAccelerationMaxMagnitudeConstraint(double max_magnitude)
      : m_max_magnitude{max_magnitude} {
    assert(max_magnitude >= 0.0);
  }

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
      [[maybe_unused]] const Pose2v<double>& pose,
      [[maybe_unused]] const Translation2v<double>& linear_velocity,
      [[maybe_unused]] const slp::Variable<double>& angular_velocity,
      const Translation2v<double>& linear_acceleration,
      [[maybe_unused]] const slp::Variable<double>& angular_acceleration) {
    if (m_max_magnitude == 0.0) {
      problem.subject_to(linear_acceleration.x() == 0.0);
      problem.subject_to(linear_acceleration.y() == 0.0);
    } else {
      // A small slack keeps the interior-point barrier away from the
      // constraint boundary, where the barrier gradient diverges and
      // causes the solver to grind through thousands of tiny steps.
      // 5% slack in magnitude (~10% in area) is within FRC model uncertainty.
      constexpr double kSlack = 1.05;
      problem.subject_to(linear_acceleration.squared_norm() <=
                         kSlack * kSlack * m_max_magnitude * m_max_magnitude);
    }
  }

 private:
  double m_max_magnitude;
};

}  // namespace trajopt
