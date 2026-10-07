# NativeBase pick compatibility

NativeBase 3.4.28 depends on the abandoned `lodash.pick` 4.x package.
The root npm override substitutes this adapter, which exports the maintained
`lodash/pick` implementation from Lodash 4.18.1. No vulnerable implementation
is copied or executed. API behavior (flat and nested paths) is retained.

Remove this directory and its override when NativeBase no longer needs it.
Regression tests cover normal selection and prototype pollution attempts.
