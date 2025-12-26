import jwt from 'jsonwebtoken';

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA3/2qZtKOJrXExCIJJF9/QJ+JKwKpcUJgIbgR/UFmkRUUbpJf
A2m5v2wH3eHQybTrwqYlPkRVaiaaYfwICINcnl56UX0ZF1GSObDpCI73cgiuuLwH
P1y+5hbIL/lNY34JoOPmgQDXMum3TqUs7dBiVgGJeFtwJTcCglVt+KDd+PfuMDP1
EbnJAuqtY24kKqbUigKLpT5ComKRDew5Z15pqkRJS2vY0dLlbcxaqz+fSiJ7mc5o
CN2IOd7jgmJcDRufcoFz7XYFfbjLO9l18aKgItsmJ24kPqdWxVXjJijJOtho0zt0
pfg1dcu8SejUk1PfvMUYC0fNy7cRuAMPOJxhZQIDAQABAoIBAGfhQvfwypBVWG4F
wuulhmS4GGtkDqVCPUcmEOG9RQ4gEpu9MmdozwZh2bwjkCsbxwM8/qTEGEDkqlCr
DCa2lWu1MVE9jTdtUz2COHEJrOSr9iwit9HA95/KDQmCu0tbFqgRScOmWid4kNTe
cdnQ/OoaSGETNw1rV7SOXjQilw9xPkkTyz/pg3GrpfIOWOyKLSnH3hY2bMWUl6X4
0rGhsJl2dhrwWREhfIv95E99Q6idm48h9Ds3QvVTSF9wzvLJKm3XI5Bzod4w0XDW
mtMeZqd7Yr8jPkOXA35BIz2dmA8vVfBIQhHmLLyq4FwI89NtloY9nY2tVPSp3a+J
gjdzofkCgYEA9j0QBNBss0s9SvXMHgPxVqyzNmIdO86GlPGe7BqH7qruxsnXQCRM
L2RmwrtvNHGjVqW7c/eG155LVVBy5imiVkvr2SRa+xRMa4aFRU+YAE+iyZXRhnHp
xKTeDGAT4ebA4nlzujoe4KvOvtqehgGfD9zJMh64NGG6ab8RD/0ToDMCgYEA6N7S
+gLU8tq04kmdar6g7Qcg392hiDvvjIE8Xd9J65Uhqccl9J/kwwdnx+ajD08CrAfa
y8wbshoeArV0Xh+Cil4k7jl0XooUsk3qFVzQNM6aq2r37HX+HQYIRqNOP4qb2mEB
Viw9EVDjw4MwxTmksPtbS6jaCK2Y+pITuT+hAAcCgYAecPIYBkRJ7hVHvRdc5pPh
aTxGjt6aVC/jHfPNsIH5iXw3ayCHN3WLrlfd3xoiW6IbxiVkcsdixJj/lRB/T8pX
7M7da1csDxhbeqfjJ7Hc5/tx/GmIu3Bw9QjWctJCbSqPVQBvl1vV3qeShKhwXKbz
aRIedhnDsAlBpXNQjLLubQKBgDd1mdlhA0YzQBEEZzEc5UaOBA5MwkOnwo072hyh
KQGqKrI8c5Wm3txzzwuUqhDjSEegN0OCALaR8cPDY0tnRbeeZD04AbbiO7ubQryD
tjJdYgihGRp/n11aKm5oRiJr6GJB6AeV0ZVmJlhRzjOqXsanlj6WoBahAWXrlDby
KG3RAoGAJ9vSs/+uAn1xTmaQMh9KRSASYTlhTX5ZYK5sZvgmuJjwcH9r8fXq/CzK
nxUn8LAtXHWjwzdt0voMghfbE/XF2ktMuSsEmuBdKW74+wMubiuBT+25FduEpCSK
p6BndbydCkK1h2E8+IB68f822Z7xnHPz+5Ao5YQV7J0HrHkCwiA=
-----END RSA PRIVATE KEY-----`;

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3/2qZtKOJrXExCIJJF9/
QJ+JKwKpcUJgIbgR/UFmkRUUbpJfA2m5v2wH3eHQybTrwqYlPkRVaiaaYfwICINc
nl56UX0ZF1GSObDpCI73cgiuuLwHP1y+5hbIL/lNY34JoOPmgQDXMum3TqUs7dBi
VgGJeFtwJTcCglVt+KDd+PfuMDP1EbnJAuqtY24kKqbUigKLpT5ComKRDew5Z15p
qkRJS2vY0dLlbcxaqz+fSiJ7mc5oCN2IOd7jgmJcDRufcoFz7XYFfbjLO9l18aKg
ItsmJ24kPqdWxVXjJijJOtho0zt0pfg1dcu8SejUk1PfvMUYC0fNy7cRuAMPOJxh
ZQIDAQAB
-----END PUBLIC KEY-----`;

jest.mock('fs', () => ({
  readFileSync: jest.fn((path: string) =>
    path.endsWith('.pub') ? PUBLIC_KEY : PRIVATE_KEY
  ),
}));

// eslint-disable-next-line import/first
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../jwt.service';

describe('jwt.service security', () => {
  const payload = { sub: 'user-id', email: 'user@example.com' };

  it('signs access tokens with RS256 and 24h expiry', () => {
    const token = generateAccessToken(payload);
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as jwt.JwtPayload;

    expect(decoded.sub).toBe('user-id');
    expect(decoded.email).toBe('user@example.com');
    expect(decoded.exp).toBeDefined();

    const expiresInSeconds = decoded.exp! - (decoded.iat as number);
    expect(expiresInSeconds).toBeGreaterThan(0);
    expect(expiresInSeconds).toBeLessThanOrEqual(24 * 60 * 60);
  });

  it('signs refresh tokens with longer expiry', () => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const accessExp = (jwt.decode(accessToken) as jwt.JwtPayload).exp!;
    const refreshExp = (jwt.decode(refreshToken) as jwt.JwtPayload).exp!;

    expect(refreshExp - accessExp).toBeGreaterThanOrEqual(6 * 24 * 60 * 60);
  });

  it('verifies valid tokens and rejects tampered ones', () => {
    const validToken = generateAccessToken(payload);
    const verified = verifyToken(validToken) as jwt.JwtPayload;

    expect(verified.email).toBe('user@example.com');

    const [header, payloadSegment, signature] = validToken.split('.');
    expect(payloadSegment).toBeDefined();
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'user-id', email: 'attacker@example.com' })
    ).toString('base64url');
    const tamperedToken = [header, tamperedPayload, signature].join('.');

    expect(verifyToken(tamperedToken)).toBeNull();
  });

  it('rejects tokens signed with different key', () => {
    const foreignPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA2m2fqoY2L37TBsQcTo9nyvp+DurMgE1Hx2JTOotMvwmQxLB6
3BLZdm8VqyDc9q+9I0MZsfYPWM+prQLe112bhDyOuqyNu2hawtDQ719mg6IUCLoC
WfFp+6lnoX0hOSg3R5VaYGLKiFKsv92H8LeFHGGdp9qJsSzp9vuTSvZJn8BWKO5d
El/LphE2Sxyru19Gre9NOhmawDwIA2p6I1OVy9NsrNOOPvJ+DXn4TrPcsC+1NGFa
YFJjpracF0wZyH1NJXRcX8OlwraBpD09h/oOzxd3jX9taMYCfyPIUGBMvPPlnTDp
8buqhAa/i+ca9Pv46kpJdAGinrl04W/5XutGwQIDAQABAoIBAQC8vfk36p0r0VUc
BZ3ILJatiGIhFbb8LssVeNsePXxlnyhfLXgcbpVGh5qbstv8tcKjk7nCUzLTtS2S
+GYChzp4u7NBjxUxmWzD5piEH1V/7S+OktyxR7Ai7DFGE8//icaqrl3X58XGolnv
uMdcs9frvFX00xwj4wGQj7apEcRwqrLeTh4AAEvCjXejcscyvIngRV83EukFaR41
qkbYDXoGvBicGfuuLiyvYYJ/UjcUQCxf/7NB5Zw3LWyKa9yaSXVVrfXfCnI8nhqm
VTa6/T5FsN0mQembOByUB1c+o/Pg2Ly3NX4uzCstKJNFj7liGIqnAIuXoboqj1Yk
sR/AFYdZAoGBAPs2cxxoSA4O/6WGMOMnX4O/kE17aXRzFw0hn5AhyytH/a4GXQxB
xZEIPeeQ9vmu0yNneemtmSiFxZRvzqWlYIVpHwHBbSRP30NCijG759vbTgo66Ew9
AOM1jkB7LCzyGXRLIrpYY16ivm7pbMyVvaxUGBMfQEoa9jJKs2xOum9nAoGBAN6X
O9h96EaRkzlDz8VoKOVY3HArY6JMl6Hp4duzj4NU+7GA50B3kO0RUl7VtjQaLtPa
rrOM2KYAH7FI75o+sll96qJkQZQkEFLgPWgtu9Bx3par91+IG8YBaLU4Lj6+45py
7ZYY3mBu/pdvbUz7A3lemxPpH55iJBZsNdYCwkeXAoGBAKE32XoSpqN3FrPYwckV
/KNlris7l3rnXZTMzkVGmselBPXJGbADCdLA8lGJZCbq/o+LGd9QzKkH6LwRYRJH
ZwFXbFHJG80hAUx+CIhQakVboeLI2UoMIGSweyGAquIRYSqUCa6DiQoz8Xjmjy9g
rgBJW8Xx2WV1lijCbhGFGPrjAoGBALe1Z74YxECh2zlS/0L04XPQMDcfiF6mCium
xTK3csW4uPZZ5gIt7F3MgwgkJ/m+dlGBVdh4cUIoLf/6q03JWxdDNgiK6Bjk3tgX
nHbD8BNsN4JxMXwV8J4uAYY3dOtyTpTlL7NGmRpL4TGI1FPJg6eC7kizidYFN7WN
36zeoAvHAoGAWusGj2jIcscI8C5Aqjy0999F6xElxGS5FgaSCvChDrycrjXnZd3L
t743X2iwaqRuSK16vzei1KVdsPxwvWmZJuSZ9kEKY4/+p8EsWCb2cZxq40HRCfh6
WtfA1iSCtsOgFsefJvfgMtzs8Q4Jnaj5Y4P1+tqBgXxgrYUrvPtdRFc=
-----END RSA PRIVATE KEY-----`;

    const foreignToken = jwt.sign(payload, foreignPrivateKey, {
      algorithm: 'RS256',
    });

    expect(verifyToken(foreignToken)).toBeNull();
  });
});
